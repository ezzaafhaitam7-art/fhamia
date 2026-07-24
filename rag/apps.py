import os
import threading

from django.apps import AppConfig


class RagConfig(AppConfig):
    name = 'rag'

    def ready(self):
        # Précharge le modèle d'embeddings et la collection Chroma au démarrage
        # du serveur plutôt qu'à la première question de l'utilisateur : sans
        # ça, le premier message reçu par un process fraîchement démarré paie
        # un coût de chargement de modèle (dizaines de secondes) au lieu de la
        # requête au LLM elle-même.
        import sys

        is_runserver = 'runserver' in sys.argv
        is_reloader_supervisor = (
            is_runserver and '--noreload' not in sys.argv and os.environ.get('RUN_MAIN') != 'true'
        )
        if is_reloader_supervisor:
            # Avec l'autoreloader, le process superviseur ne sert jamais de
            # requêtes : seul l'enfant réel (RUN_MAIN=true) doit précharger.
            return

        def warmup():
            try:
                from .services import retrieve
                retrieve('warmup', top_k=1)
            except Exception:
                pass

        threading.Thread(target=warmup, daemon=True).start()
