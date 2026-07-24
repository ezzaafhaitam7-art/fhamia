from django.utils.text import slugify
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import Utilisateur

from .models import Lecon, Parcours, Playground, Visualisation
from .serializers import LeconSerializer, ParcoursSerializer, PlaygroundSerializer, VisualisationSerializer


class ParcoursViewSet(viewsets.ModelViewSet):
    queryset = Parcours.objects.all()
    serializer_class = ParcoursSerializer
    lookup_field = "slug"

    def perform_create(self, serializer):
        slug = slugify(serializer.validated_data.get("titre", ""))
        base_slug = slug or "parcours"
        candidate = base_slug
        i = 1
        while Parcours.objects.filter(slug=candidate).exists():
            i += 1
            candidate = f"{base_slug}-{i}"
        serializer.save(slug=candidate)

    @action(detail=True, methods=["post"])
    def suivre(self, request, slug=None):
        parcours = self.get_object()
        utilisateur_id = request.data.get("utilisateur")
        if not utilisateur_id:
            return Response({"error": "utilisateur est requis."}, status=400)
        utilisateur = Utilisateur.objects.get(pk=utilisateur_id)
        parcours.apprenants.add(utilisateur)
        return Response({"status": "ok"})


class LeconViewSet(viewsets.ModelViewSet):
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer


class PlaygroundViewSet(viewsets.ModelViewSet):
    queryset = Playground.objects.all()
    serializer_class = PlaygroundSerializer


class VisualisationViewSet(viewsets.ModelViewSet):
    queryset = Visualisation.objects.all()
    serializer_class = VisualisationSerializer
