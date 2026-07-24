from django.db import models

from accounts.models import Utilisateur


class FichierVirtuel(models.Model):
    TYPE_CHOICES = [("dir", "Dossier"), ("file", "Fichier")]

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="fichiers_virtuels")
    chemin = models.CharField(max_length=500)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    contenu = models.TextField(blank=True, default="")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("utilisateur", "chemin")

    def __str__(self):
        return f"{self.chemin} ({self.type})"
