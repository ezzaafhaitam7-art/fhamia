from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("parcours", views.ParcoursViewSet)
router.register("lecons", views.LeconViewSet)
router.register("playgrounds", views.PlaygroundViewSet)
router.register("visualisations", views.VisualisationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
