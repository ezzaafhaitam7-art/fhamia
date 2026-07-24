from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("quiz", views.QuizViewSet)
router.register("questions", views.QuestionViewSet)
router.register("progressions", views.ProgressionViewSet)

urlpatterns = [
    path("submit-progression/", views.submit_progression, name="submit-progression"),
    path("quiz-by-slug/<slug:slug>/", views.quiz_by_slug, name="quiz-by-slug"),
    path("", include(router.urls)),
]
