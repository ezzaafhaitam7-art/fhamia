from django.db import models

from accounts.models import Administrateur, Utilisateur


class Parcours(models.Model):
    slug = models.SlugField(max_length=50, unique=True, null=True, blank=True)
    titre = models.CharField(max_length=200)
    description = models.TextField()
    niveau = models.CharField(max_length=20)
    administrateur = models.ForeignKey(
        Administrateur, on_delete=models.SET_NULL, null=True, blank=True, related_name="parcours_geres"
    )
    apprenants = models.ManyToManyField(Utilisateur, related_name="parcours_suivis", blank=True)


class Lecon(models.Model):
    parcours = models.ForeignKey(Parcours, on_delete=models.CASCADE, related_name="lecons")
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    duree = models.IntegerField(help_text="Durée en minutes")


class Playground(models.Model):
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE, related_name="playgrounds")
    nom = models.CharField(max_length=100)
    description = models.TextField()


class Visualisation(models.Model):
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE, related_name="visualisations")
    type = models.CharField(max_length=50)
    description = models.TextField()
