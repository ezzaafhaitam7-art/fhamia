import threading

from django.conf import settings

from .chroma_client import get_collection
from .language import is_darija
from .llm import ask_chat, ask_ollama

# Le client Chroma (bindings Rust) n'est pas garanti thread-safe pour des
# requêtes concurrentes : deux threads Django interrogeant la collection en
# même temps peuvent corrompre son état pour tout le process (erreur
# "RustBindingsAPI object has no attribute 'bindings'" observée en pratique).
# On sérialise donc l'accès.
_CHROMA_LOCK = threading.Lock()

SYSTEM_PROMPT = (
    "Tu es le tuteur IA de FhamIA. Réponds en français, de façon claire et pédagogique, "
    "en t'appuyant uniquement sur le contexte fourni. Si le contexte ne contient pas la "
    "réponse, dis-le honnêtement plutôt que d'inventer. Réponds en 2 à 3 phrases courtes "
    "maximum, sois concis et va droit au but."
)

DARIJA_SYSTEM_PROMPT = (
    "Tu es le tuteur IA de FhamIA. Réponds uniquement en darija marocaine (écriture arabe), "
    "de façon claire et pédagogique, en t'appuyant uniquement sur le contexte fourni (il est "
    "en français, comprends-le et réponds directement en darija sans jamais répondre en "
    "français). Si le contexte ne contient pas la réponse, dis-le honnêtement plutôt que "
    "d'inventer. Réponds en 2 à 3 phrases courtes maximum, sois concis et va droit au but."
)

# Base du prompt utilisé par le chat en streaming : un seul appel au modèle,
# qui doit tenir compte de l'historique et rester naturel comme une
# conversation de chat plutôt qu'une simple réponse RAG. La consigne de
# langue n'est PAS laissée à l'appréciation du modèle (peu fiable sur un
# petit modèle 1B) : elle est injectée explicitement par chat_system_prompt()
# selon la détection is_darija() faite côté serveur sur la question reçue.
CHAT_SYSTEM_PROMPT_BASE = (
    "Tu es le tuteur IA de FhamIA, un assistant pédagogique conversationnel. "
    "Utilise l'historique de la conversation pour comprendre le contexte de la question. "
    "Si un contexte de cours est fourni et pertinent, appuie-toi dessus sans jamais "
    "inventer d'information absente. Si la question est juste une salutation ou du small "
    "talk, réponds naturellement et brièvement sans parler de cours. Sois clair et "
    "pédagogique : reste bref pour une question simple, mais développe autant que "
    "nécessaire pour une question qui demande une vraie explication (comme le ferait "
    "ChatGPT). Dans tous les cas, termine TOUJOURS tes phrases jusqu'au point final, "
    "ne t'arrête jamais au milieu d'une idée. "
    "L'historique de la conversation ci-dessous sert UNIQUEMENT à comprendre le contexte : "
    "ce ne sont jamais des noms, prénoms ou salutations à répéter. Ne commence JAMAIS ta "
    "réponse en citant ou reformulant une question précédente comme si c'était le nom de "
    "l'apprenant ou une formule d'adresse : réponds directement à la nouvelle question."
)


# Atlas-Chat (modèle dédié darija) est un petit modèle spécialisé : un prompt
# système long et méta (RAG, historique, instructions sur le ton...) le
# déstabilise et le fait halluciner (ex: il invente être un "assistant
# égyptien" hors sujet). On lui donne donc une consigne courte et directe,
# différente de celle du modèle de chat général.
DARIJA_ATLAS_SYSTEM_PROMPT = (
    "You are a helpful Moroccan Darija assistant for the FhamIA learning platform. "
    "Answer the student's question in Moroccan Darija ONLY — the dialect spoken in "
    "Morocco, not Egyptian Arabic, not Modern Standard Arabic, not any other dialect. "
    "Use Moroccan-specific words (like 'daba', 'bzaf', 'wach', 'dyal', 'chno') rather "
    "than Egyptian equivalents. Using the provided course context if it is relevant. "
    "Answer the actual question directly and clearly."
)


def chat_system_prompt(darija):
    if darija:
        return DARIJA_ATLAS_SYSTEM_PROMPT
    language_directive = (
        "CONSIGNE DE LANGUE OBLIGATOIRE : la question de l'apprenant est en français. "
        "Tu DOIS répondre ENTIÈREMENT en français, jamais en darija."
    )
    return f"{CHAT_SYSTEM_PROMPT_BASE}\n\n{language_directive}"


def retrieve(question, top_k=3):
    with _CHROMA_LOCK:
        collection = get_collection()
        results = collection.query(query_texts=[question], n_results=top_k)

    chunks = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    return list(zip(chunks, metadatas))


def build_prompt(question, chunks, history=None):
    context = "\n\n".join(
        f"[Source: {meta.get('source', 'inconnue')}]\n{text}" for text, meta in chunks
    )
    history_block = ""
    if history:
        turns = "\n".join(f"- {h['role']} a dit : \"{h['text']}\"" for h in history)
        history_block = (
            "Historique de la conversation (contexte seulement, ne pas y répondre à nouveau "
            f"ni en réutiliser le contenu comme nom ou salutation) :\n{turns}\n\n"
        )

    return (
        f"Contexte extrait des supports de cours :\n{context}\n\n"
        f"{history_block}"
        f"Question de l'apprenant : {question}\n\n"
        "Réponds en te basant sur ce contexte et, si pertinent, sur l'échange précédent."
    )


def build_darija_prompt(question, chunks):
    # Prompt minimal pour Atlas-Chat (modèle darija dédié, petit) : pas de
    # jargon RAG ni d'historique, juste le contexte utile et la question,
    # pour éviter de le déstabiliser.
    if chunks:
        context = "\n\n".join(text for text, _meta in chunks)
        return f"Course context:\n{context}\n\nStudent question: {question}"
    return f"Student question: {question}"


def translate_to_darija(french_text):
    prompt = (
        "Traduis fidèlement ce texte en darija marocaine (écriture arabe), sans changer le "
        f"sens, sans rien ajouter d'autre que la traduction :\n\n{french_text}"
    )
    # Une traduction n'a pas besoin de "liberté" créative : sa longueur est
    # bornée par le texte source. On laisse une marge large (400) pour ne
    # jamais couper une vraie traduction, sans payer le coût d'un num_predict
    # illimité comme sur la génération de contenu.
    return ask_ollama(prompt, num_predict=400, model=settings.DARIJA_MODEL, temperature=0.1)


def translate_to_french(darija_text):
    prompt = (
        "Traduis fidèlement cette question en français correct, mot pour mot si possible, "
        f"sans changer le sens ni ajouter d'autre texte que la traduction :\n\n{darija_text}"
    )
    return ask_ollama(prompt, num_predict=200, model=settings.DARIJA_MODEL, temperature=0.1)


def rag_answer(question, top_k=2):
    original_question = question
    darija = is_darija(question)

    if darija:
        question = translate_to_french(question)

    chunks = retrieve(question, top_k=top_k)
    prompt = build_prompt(question, chunks)
    answer = ask_chat(prompt, system=SYSTEM_PROMPT, num_predict=-1)

    if darija:
        answer = translate_to_darija(answer)

    sources = sorted({meta.get("source", "inconnue") for _, meta in chunks})
    return {"answer": answer, "sources": sources, "question_traduite": question if darija else None}
