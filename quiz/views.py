from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from courses.models import Parcours

from .models import Progression, Question, Quiz
from .serializers import ProgressionSerializer, QuestionSerializer, QuizSerializer


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


@api_view(["GET"])
def quiz_by_slug(request, slug):
    quiz = get_object_or_404(Quiz, lecon__parcours__slug=slug)
    return Response(QuizSerializer(quiz).data)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class ProgressionViewSet(viewsets.ModelViewSet):
    queryset = Progression.objects.all()
    serializer_class = ProgressionSerializer


@api_view(["POST"])
def submit_progression(request):
    data = request.data
    utilisateur_id = data.get("utilisateur")
    parcours_id = data.get("parcours")
    pourcentage = data.get("pourcentage", 0)
    points = data.get("points", 0)

    if not utilisateur_id or not parcours_id:
        return Response({"error": "utilisateur et parcours sont requis."}, status=400)

    if not Parcours.objects.filter(id=parcours_id).exists():
        return Response({"error": "Parcours introuvable."}, status=404)

    progression, _ = Progression.objects.update_or_create(
        utilisateur_id=utilisateur_id,
        parcours_id=parcours_id,
        defaults={"pourcentage": pourcentage, "points": points},
    )
    return Response(ProgressionSerializer(progression).data)
