from django.urls import path

from . import views

urlpatterns = [
    path("query/", views.query_view, name="rag-query"),
    path("query-stream/", views.query_stream_view, name="rag-query-stream"),
    path("evaluate/", views.evaluate_view, name="rag-evaluate"),
    path("prompt/", views.prompt_view, name="rag-prompt"),
    path("prompt-stream/", views.prompt_stream_view, name="rag-prompt-stream"),
]
