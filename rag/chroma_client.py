import chromadb
from django.conf import settings

_client = None


def get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
    return _client


def get_collection():
    from .embeddings import get_embedding_function

    return get_client().get_or_create_collection(
        name=settings.CHROMA_COLLECTION_NAME,
        embedding_function=get_embedding_function(),
    )
