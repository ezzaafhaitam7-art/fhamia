from rest_framework import serializers

from .models import Progression, Question, Quiz


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "quiz", "enonce", "choix", "reponse_correcte"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    parcours_slug = serializers.CharField(source="lecon.parcours.slug", read_only=True)
    parcours_id = serializers.IntegerField(source="lecon.parcours.id", read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "lecon", "titre", "score_minimum", "questions", "parcours_slug", "parcours_id"]


class ProgressionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progression
        fields = ["id", "utilisateur", "parcours", "pourcentage", "points", "niveau"]
