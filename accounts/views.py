import uuid

from django.contrib.auth.hashers import check_password, make_password
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from quiz.models import Progression

from .models import Administrateur, Certificat, MessageSupport, Utilisateur
from .serializers import (
    AdministrateurSerializer,
    CertificatSerializer,
    MessageSupportSerializer,
    UtilisateurSerializer,
)


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all().order_by("-date_inscription")
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated]


class AdministrateurViewSet(viewsets.ModelViewSet):
    queryset = Administrateur.objects.all().order_by("-date_inscription")
    serializer_class = AdministrateurSerializer
    permission_classes = [IsAuthenticated]


class CertificatViewSet(viewsets.ModelViewSet):
    queryset = Certificat.objects.all().order_by("-date_obtention")
    serializer_class = CertificatSerializer
    permission_classes = [IsAuthenticated]


class MessageSupportViewSet(viewsets.ModelViewSet):
    queryset = MessageSupport.objects.all()
    serializer_class = MessageSupportSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    prenom = (data.get("prenom") or "").strip()
    nom = (data.get("nom") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not prenom or not nom or not email or not password:
        return Response({"error": "Tous les champs sont requis."}, status=400)

    if Utilisateur.objects.filter(email=email).exists():
        return Response({"error": "Un compte existe déjà avec cet email."}, status=400)

    utilisateur = Utilisateur.objects.create(
        prenom=prenom,
        nom=nom,
        email=email,
        mot_de_passe=make_password(password),
    )
    refresh = RefreshToken.for_user(utilisateur)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UtilisateurSerializer(utilisateur).data,
    }, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    try:
        utilisateur = Utilisateur.objects.get(email=email)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Email ou mot de passe incorrect."}, status=401)

    if not check_password(password, utilisateur.mot_de_passe):
        return Response({"error": "Email ou mot de passe incorrect."}, status=401)

    refresh = RefreshToken.for_user(utilisateur)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UtilisateurSerializer(utilisateur).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UtilisateurSerializer(request.user).data)


@api_view(["POST"])
def obtenir_certificat(request):
    data = request.data
    utilisateur_id = data.get("utilisateur")
    parcours_id = data.get("parcours")

    if not utilisateur_id or not parcours_id:
        return Response({"error": "utilisateur et parcours sont requis."}, status=400)

    try:
        progression = Progression.objects.get(utilisateur_id=utilisateur_id, parcours_id=parcours_id)
    except Progression.DoesNotExist:
        return Response({"error": "Aucune progression trouvée pour ce parcours."}, status=404)

    if progression.pourcentage < 100:
        return Response({"error": "Le parcours doit être terminé à 100% pour obtenir le certificat."}, status=400)

    certificat, created = Certificat.objects.get_or_create(
        utilisateur_id=utilisateur_id,
        parcours_id=parcours_id,
        defaults={"code_verification": f"FH-{uuid.uuid4().hex[:10].upper()}"},
    )
    return Response(CertificatSerializer(certificat).data, status=201 if created else 200)
