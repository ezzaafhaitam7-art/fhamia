from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Utilisateur


class UtilisateurJWTAuthentication(JWTAuthentication):
    """JWT authentication backed by the custom Utilisateur model instead of Django's auth User."""

    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        if user_id is None:
            raise InvalidToken("Token invalide : identifiant utilisateur manquant.")
        try:
            return Utilisateur.objects.get(pk=user_id)
        except Utilisateur.DoesNotExist:
            raise InvalidToken("Utilisateur introuvable.")
