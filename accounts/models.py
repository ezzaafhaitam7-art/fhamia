from django.db import models


class Utilisateur(models.Model):
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)
    date_inscription = models.DateTimeField(auto_now_add=True)
    etat_compte = models.CharField(max_length=20, default="actif")

    # Requis par DRF (IsAuthenticated, etc.) car ce modèle n'hérite pas de AbstractUser.
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


class Administrateur(Utilisateur):
    niveau_acces = models.IntegerField(default=1)
    date_nomination = models.DateField(auto_now_add=True)


class MessageSupport(models.Model):
    nom = models.CharField(max_length=150)
    email = models.EmailField()
    sujet = models.CharField(max_length=100)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    traite = models.BooleanField(default=False)

    class Meta:
        ordering = ["-date_envoi"]


class Certificat(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="certificats")
    parcours = models.ForeignKey("courses.Parcours", on_delete=models.CASCADE, related_name="certificats")
    date_obtention = models.DateTimeField(auto_now_add=True)
    code_verification = models.CharField(max_length=64, unique=True)

    class Meta:
        unique_together = ("utilisateur", "parcours")
