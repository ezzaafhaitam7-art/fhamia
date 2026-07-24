import json
import re

from django.conf import settings
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .language import is_darija, is_smalltalk
from .llm import ask_chat, ask_chat_stream
from .services import build_prompt, chat_system_prompt, rag_answer, retrieve, translate_to_darija, translate_to_french

# Priorité absolue à des réponses complètes, jamais coupées, quitte à
# attendre : num_predict=-1 laisse le modèle s'arrêter tout seul (fin de
# phrase naturelle), max_seconds n'est qu'un filet de sécurité très large
# (modèle en boucle infinie), pas un budget qu'on vise à atteindre.
MAX_ANSWER_TOKENS = -1
MAX_ANSWER_SECONDS = 180
MAX_HISTORY_TURNS = 2

# Marqueur ajouté quand la génération est coupée par le budget de temps :
# jamais réinjecté dans l'historique, sinon le modèle voit son propre message
# d'excuse/erreur et se met à s'excuser en boucle plutôt que de répondre.
CUTOFF_MARKER_RE = re.compile(r"\*\(le modèle a mis trop de temps.*?\)\*", re.DOTALL)

EVAL_SYSTEM_PROMPT = (
    "Tu es un correcteur pédagogique pour la plateforme FhamIA. On te donne une consigne "
    "d'exercice et la réponse d'un apprenant. Évalue si la réponse est correcte, explique "
    "pourquoi en français, de façon bienveillante et pédagogique, et donne la bonne réponse "
    "si l'apprenant s'est trompé. Réponds en 3 à 5 phrases maximum."
)


@csrf_exempt
@require_POST
def query_view(request):
    try:
        body = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON invalide"}, status=400)

    question = (body.get("question") or "").strip()
    if not question:
        return JsonResponse({"error": "Le champ 'question' est requis."}, status=400)

    try:
        result = rag_answer(question)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)

    return JsonResponse(result)


@csrf_exempt
@require_POST
def query_stream_view(request):
    try:
        body = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON invalide"}, status=400)

    question = (body.get("question") or "").strip()
    if not question:
        return JsonResponse({"error": "Le champ 'question' est requis."}, status=400)

    raw_history = body.get("history") or []
    history = []
    for h in raw_history:
        if not isinstance(h, dict):
            continue
        text = CUTOFF_MARKER_RE.sub("", (h.get("text") or "")).strip()
        if not text:
            continue
        history.append({"role": "Apprenant" if h.get("role") == "user" else "Tuteur", "text": text})
    history = history[-MAX_HISTORY_TURNS:]

    # La langue de réponse est forcée explicitement (chat_system_prompt) selon
    # la détection is_darija() faite ici, plutôt que laissée à l'appréciation
    # du modèle. Le RAG est sauté pour le small talk pour ne pas gonfler le
    # prompt inutilement.
    darija = is_darija(question)
    chunks = []
    if not is_smalltalk(question):
        # Pour une question en darija écrite en latin (ex: "ashno lfar9 bin
        # update w create"), chercher directement dans le cours (en français)
        # avec ce texte donne des résultats hors sujet : la recherche par
        # similarité ne matche presque rien. On traduit d'abord en français
        # pour trouver le bon passage de cours, ET on réutilise cette
        # traduction comme question posée au modèle (voir plus bas) : générer
        # la réponse en français puis la traduire en darija donne un bien
        # meilleur résultat que de faire générer le texte en darija
        # directement (les modèles, même spécialisés, y sont peu fiables).
        retrieval_query = translate_to_french(question) if darija else question
        try:
            chunks = retrieve(retrieval_query, top_k=1)
        except Exception as exc:
            return JsonResponse({"error": str(exc)}, status=500)
    else:
        retrieval_query = question

    prompt = build_prompt(retrieval_query, chunks, history=history)
    sources = sorted({meta.get("source", "inconnue") for _, meta in chunks})

    def gen():
        try:
            if darija:
                # Pas de streaming token par token ici : il faut la réponse
                # française complète avant de pouvoir la traduire fidèlement.
                french_answer = ask_chat(
                    prompt,
                    system=chat_system_prompt(False),
                    num_predict=MAX_ANSWER_TOKENS,
                )
                yield translate_to_darija(french_answer)
                return
            stream = ask_chat_stream(
                prompt,
                system=chat_system_prompt(darija),
                num_predict=MAX_ANSWER_TOKENS,
                max_seconds=MAX_ANSWER_SECONDS,
            )
            for token in stream:
                yield token
        except Exception as exc:
            yield f"\n\n[Erreur pendant la génération : {exc}]"

    response = StreamingHttpResponse(gen(), content_type="text/plain; charset=utf-8")
    response["X-Sources"] = ",".join(sources)
    response["X-Question-Traduite"] = ""
    return response


@csrf_exempt
@require_POST
def evaluate_view(request):
    try:
        body = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON invalide"}, status=400)

    consigne = (body.get("consigne") or "").strip()
    reponse = (body.get("reponse") or "").strip()

    if not consigne or not reponse:
        return JsonResponse({"error": "Les champs 'consigne' et 'reponse' sont requis."}, status=400)

    prompt = f"Consigne de l'exercice :\n{consigne}\n\nRéponse de l'apprenant :\n{reponse}"

    try:
        feedback = ask_chat(prompt, system=EVAL_SYSTEM_PROMPT)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)

    return JsonResponse({"feedback": feedback})


@csrf_exempt
@require_POST
def prompt_view(request):
    try:
        body = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON invalide"}, status=400)

    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return JsonResponse({"error": "Le champ 'prompt' est requis."}, status=400)

    temperature = body.get("temperature")
    num_predict = body.get("num_predict", 200)

    try:
        temperature = float(temperature) if temperature is not None else None
        num_predict = int(num_predict)
    except (TypeError, ValueError):
        return JsonResponse({"error": "Paramètres invalides."}, status=400)

    try:
        response = ask_chat(prompt, num_predict=num_predict, temperature=temperature)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)

    return JsonResponse({"response": response})


@csrf_exempt
@require_POST
def prompt_stream_view(request):
    try:
        body = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON invalide"}, status=400)

    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return JsonResponse({"error": "Le champ 'prompt' est requis."}, status=400)

    temperature = body.get("temperature")
    num_predict = body.get("num_predict", 200)

    try:
        temperature = float(temperature) if temperature is not None else None
        num_predict = int(num_predict)
    except (TypeError, ValueError):
        return JsonResponse({"error": "Paramètres invalides."}, status=400)

    def gen():
        try:
            for token in ask_chat_stream(prompt, num_predict=num_predict, temperature=temperature):
                yield token
        except Exception as exc:
            yield f"\n\n[Erreur pendant la génération : {exc}]"

    return StreamingHttpResponse(gen(), content_type="text/plain; charset=utf-8")
