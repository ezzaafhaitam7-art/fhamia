from django.db import models

from accounts.models import Utilisateur
from courses.models import Lecon, Parcours


class Quiz(models.Model):
    lecon = models.OneToOneField(Lecon, on_delete=models.CASCADE, related_name="quiz", null=True, blank=True)
    titre = models.CharField(max_length=200)
    score_minimum = models.IntegerField(default=50)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    enonce = models.TextField()
    choix = models.JSONField()
    reponse_correcte = models.CharField(max_length=255)


class Progression(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="progressions")
    parcours = models.ForeignKey(Parcours, on_delete=models.CASCADE, related_name="progressions")
    pourcentage = models.FloatField(default=0)
    points = models.IntegerField(default=0)
    niveau = models.IntegerField(default=1)

    class Meta:
        unique_together = ("utilisateur", "parcours")
