import json
import time

import requests
from django.conf import settings
from openai import AzureOpenAI, OpenAI


def ask_ollama(prompt, system=None, num_predict=150, temperature=None, model=None):
    options = {"num_predict": num_predict}
    if temperature is not None:
        options["temperature"] = temperature

    payload = {
        "model": model or settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": options,
        "keep_alive": "30m",
    }
    if system:
        payload["system"] = system

    response = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json=payload,
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["response"]


def ask_ollama_stream(prompt, system=None, num_predict=150, temperature=None, model=None, max_seconds=None):
    options = {"num_predict": num_predict}
    if temperature is not None:
        options["temperature"] = temperature

    payload = {
        "model": model or settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "options": options,
        "keep_alive": "30m",
    }
    if system:
        payload["system"] = system

    started = time.monotonic()
    # (connect_timeout, read_timeout) : read_timeout borne l'attente entre deux
    # bouts de réponse Ollama. Il doit rester généreux car le premier token peut
    # tarder (le temps de traitement du contexte, "prompt eval", sur CPU) :
    # c'est max_seconds ci-dessous, vérifié après chaque token reçu, qui borne
    # la durée réelle perçue par l'utilisateur, pas ce timeout réseau.
    read_timeout = 60

    try:
        with requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json=payload,
            stream=True,
            timeout=(5, read_timeout),
        ) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                data = json.loads(line)
                token = data.get("response", "")
                if token:
                    yield token
                if data.get("done"):
                    break
                if max_seconds is not None and time.monotonic() - started > max_seconds:
                    # On arrête silencieusement : le texte déjà streamé reste
                    # affiché tel quel, sans note d'erreur qui ne ferait que
                    # semer la confusion alors que la réponse est déjà lisible.
                    break
    except requests.exceptions.Timeout:
        yield "\n\n*(le modèle ne répond pas, vérifie qu'Ollama est bien démarré et réessaie)*"


_azure_client = None


def _get_azure_client():
    # Client réutilisé entre les appels (connexion HTTP conservée) plutôt que
    # recréé à chaque requête.
    global _azure_client
    if _azure_client is None:
        _azure_client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
    return _azure_client


def ask_azure(prompt, system=None, num_predict=150, temperature=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {}
    if temperature is not None:
        kwargs["temperature"] = temperature
    # num_predict=-1 (convention Ollama pour "pas de limite") : Azure n'accepte
    # pas de valeur négative, on omet simplement max_tokens dans ce cas pour
    # laisser le modèle s'arrêter naturellement.
    if num_predict and num_predict > 0:
        kwargs["max_tokens"] = num_predict

    client = _get_azure_client()
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=messages,
        **kwargs,
    )
    return response.choices[0].message.content


def ask_azure_stream(prompt, system=None, num_predict=150, temperature=None, max_seconds=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {}
    if temperature is not None:
        kwargs["temperature"] = temperature
    if num_predict and num_predict > 0:
        kwargs["max_tokens"] = num_predict

    started = time.monotonic()
    client = _get_azure_client()
    try:
        stream = client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT,
            messages=messages,
            stream=True,
            **kwargs,
        )
        for chunk in stream:
            if not chunk.choices:
                continue
            token = chunk.choices[0].delta.content or ""
            if token:
                yield token
            if max_seconds is not None and time.monotonic() - started > max_seconds:
                break
    except Exception as exc:
        yield f"\n\n*(erreur Azure OpenAI : {exc})*"


_groq_client = None


def _get_groq_client():
    # Groq expose une API compatible OpenAI : même SDK, juste une base_url
    # différente et pas besoin de la complexité Azure (endpoint/déploiement).
    global _groq_client
    if _groq_client is None:
        _groq_client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
    return _groq_client


def ask_groq(prompt, system=None, num_predict=150, temperature=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {}
    if temperature is not None:
        kwargs["temperature"] = temperature
    if num_predict and num_predict > 0:
        kwargs["max_tokens"] = num_predict

    client = _get_groq_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        **kwargs,
    )
    return response.choices[0].message.content


def ask_groq_stream(prompt, system=None, num_predict=150, temperature=None, max_seconds=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {}
    if temperature is not None:
        kwargs["temperature"] = temperature
    if num_predict and num_predict > 0:
        kwargs["max_tokens"] = num_predict

    started = time.monotonic()
    client = _get_groq_client()
    try:
        stream = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            stream=True,
            **kwargs,
        )
        for chunk in stream:
            if not chunk.choices:
                continue
            token = chunk.choices[0].delta.content or ""
            if token:
                yield token
            if max_seconds is not None and time.monotonic() - started > max_seconds:
                break
    except Exception as exc:
        yield f"\n\n*(erreur Groq : {exc})*"


def ask_chat(prompt, system=None, num_predict=150, temperature=None, model=None):
    # Point d'entrée unique pour le modèle de chat général : bascule entre
    # Ollama (local), Azure OpenAI et Groq (cloud, rapide) selon LLM_PROVIDER,
    # sans toucher au modèle darija dédié (Atlas-Chat) qui reste sur Ollama.
    if settings.LLM_PROVIDER == "groq":
        return ask_groq(prompt, system=system, num_predict=num_predict, temperature=temperature)
    if settings.LLM_PROVIDER == "azure":
        return ask_azure(prompt, system=system, num_predict=num_predict, temperature=temperature)
    return ask_ollama(prompt, system=system, num_predict=num_predict, temperature=temperature, model=model)


def ask_chat_stream(prompt, system=None, num_predict=150, temperature=None, model=None, max_seconds=None):
    if settings.LLM_PROVIDER == "groq":
        yield from ask_groq_stream(prompt, system=system, num_predict=num_predict, temperature=temperature, max_seconds=max_seconds)
    elif settings.LLM_PROVIDER == "azure":
        yield from ask_azure_stream(prompt, system=system, num_predict=num_predict, temperature=temperature, max_seconds=max_seconds)
    else:
        yield from ask_ollama_stream(prompt, system=system, num_predict=num_predict, temperature=temperature, model=model, max_seconds=max_seconds)


def _ask_groq_darija(prompt, system=None, num_predict=150, temperature=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    kwargs = {}
    if temperature is not None:
        kwargs["temperature"] = temperature
    if num_predict and num_predict > 0:
        kwargs["max_tokens"] = num_predict

    client = _get_groq_client()
    response = client.chat.completions.create(
        model=settings.GROQ_DARIJA_MODEL,
        messages=messages,
        **kwargs,
    )
    return response.choices[0].message.content


def ask_translate(prompt, system=None, num_predict=150, temperature=None):
    # Traduction darija<->français uniquement : Groq (modèle large) est fiable
    # ici une fois un system prompt de traducteur strict fourni, et bien plus
    # rapide qu'Ollama.
    if settings.LLM_PROVIDER == "groq":
        return _ask_groq_darija(prompt, system=system, num_predict=num_predict, temperature=temperature)
    return ask_ollama(prompt, system=system, num_predict=num_predict, temperature=temperature, model=settings.DARIJA_MODEL)


