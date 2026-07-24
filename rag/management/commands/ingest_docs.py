import uuid

from django.conf import settings
from django.core.management.base import BaseCommand
from pypdf import PdfReader

from rag.chroma_client import get_collection

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150

DOCUMENTS = [
    ("linux", settings.BASE_DIR / "frontend" / "public" / "support-de-cours-linux.pdf"),
    ("reseaux", settings.BASE_DIR / "frontend" / "public" / "reseaulivre.pdf"),
    ("bdd", settings.BASE_DIR / "frontend" / "public" / "basedonnees.pdf"),
    ("ia", settings.BASE_DIR / "frontend" / "public" / "ailivre.pdf"),
]


def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
    return [c.strip() for c in chunks if c.strip()]


class Command(BaseCommand):
    help = "Extrait le texte des PDF de cours et les indexe dans ChromaDB pour le RAG."

    def add_arguments(self, parser):
        parser.add_argument(
            "--domain",
            help="N'indexer qu'un seul domaine (linux, reseaux, bdd, ia).",
        )

    def handle(self, *args, **options):
        collection = get_collection()
        only_domain = options.get("domain")

        for domain, path in DOCUMENTS:
            if only_domain and domain != only_domain:
                continue
            if not path.exists():
                self.stdout.write(self.style.WARNING(f"Fichier introuvable, ignoré : {path}"))
                continue

            self.stdout.write(f"Lecture de {path.name}…")
            reader = PdfReader(str(path))

            ids, docs, metas = [], [], []
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                for chunk in chunk_text(text):
                    ids.append(str(uuid.uuid4()))
                    docs.append(chunk)
                    metas.append({"domain": domain, "source": path.name, "page": page_num})

            if not docs:
                self.stdout.write(self.style.WARNING(f"Aucun texte extrait de {path.name}."))
                continue

            batch_size = 100
            for i in range(0, len(docs), batch_size):
                collection.upsert(
                    ids=ids[i : i + batch_size],
                    documents=docs[i : i + batch_size],
                    metadatas=metas[i : i + batch_size],
                )

            self.stdout.write(self.style.SUCCESS(f"{len(docs)} passages indexés pour {domain} ({path.name})."))

        self.stdout.write(self.style.SUCCESS("Ingestion terminée."))
