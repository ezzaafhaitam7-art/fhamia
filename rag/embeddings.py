from django.conf import settings

_embedding_function = None


def get_embedding_function():
    # DefaultEmbeddingFunction (ONNX, ~90 Mo) au lieu de SentenceTransformer
    # (torch, ~1-2 Go) : ce dernier fait planter le serveur en production par
    # manque de mémoire (limite 512 Mo du tier gratuit Render). Contrepartie :
    # modèle optimisé anglais plutôt que multilingue, retrieval un peu moins
    # précis sur le français, mais fonctionnel et stable.
    global _embedding_function
    if _embedding_function is None:
        if settings.EMBEDDING_BACKEND == "onnx":
            from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

            _embedding_function = DefaultEmbeddingFunction()
        else:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

            _embedding_function = SentenceTransformerEmbeddingFunction(model_name=settings.EMBEDDING_MODEL)
    return _embedding_function
