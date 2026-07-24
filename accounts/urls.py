from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register("utilisateurs", views.UtilisateurViewSet)
router.register("administrateurs", views.AdministrateurViewSet)
router.register("certificats", views.CertificatViewSet)
router.register("messages-support", views.MessageSupportViewSet)

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.me_view, name="me"),
    path("obtenir-certificat/", views.obtenir_certificat, name="obtenir-certificat"),
    path("", include(router.urls)),
]
