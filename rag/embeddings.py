from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from django.conf import settings

_embedding_function = None


def get_embedding_function():
    global _embedding_function
    if _embedding_function is None:
        _embedding_function = SentenceTransformerEmbeddingFunction(model_name=settings.EMBEDDING_MODEL)
    return _embedding_function
