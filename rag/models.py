from django.db import models

from accounts.models import Utilisateur


class TuteurIA(models.Model):
    modele_llm = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    langue = models.CharField(max_length=20, default="fr")


class Conversation(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="conversations")
    tuteur = models.ForeignKey(TuteurIA, on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations")
    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, default="active")


class Message(models.Model):
    TYPE_CHOICES = [("utilisateur", "Utilisateur"), ("ia", "Tuteur IA")]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    date_heure = models.DateTimeField(auto_now_add=True)
    contenu = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
