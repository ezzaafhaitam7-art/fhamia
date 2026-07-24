from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from .models import Administrateur, Certificat, MessageSupport, Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ancien_mot_de_passe = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "prenom",
            "nom",
            "email",
            "date_inscription",
            "etat_compte",
            "password",
            "ancien_mot_de_passe",
            "is_admin",
        ]

    def get_is_admin(self, obj):
        return Administrateur.objects.filter(pk=obj.pk).exists()

    def create(self, validated_data):
        validated_data.pop("ancien_mot_de_passe", None)
        password = validated_data.pop("password", None) or "changeme123"
        validated_data["mot_de_passe"] = make_password(password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        ancien_mot_de_passe = validated_data.pop("ancien_mot_de_passe", None)
        if password:
            if not ancien_mot_de_passe or not check_password(ancien_mot_de_passe, instance.mot_de_passe):
                raise serializers.ValidationError({"ancien_mot_de_passe": "Mot de passe actuel incorrect."})
            instance.mot_de_passe = make_password(password)
        return super().update(instance, validated_data)


class AdministrateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrateur
        fields = ["id", "prenom", "nom", "email", "date_inscription", "etat_compte", "niveau_acces", "date_nomination"]


class MessageSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageSupport
        fields = ["id", "nom", "email", "sujet", "message", "date_envoi", "traite"]
        read_only_fields = ["date_envoi", "traite"]


class CertificatSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.SerializerMethodField()
    parcours_titre = serializers.CharField(source="parcours.titre", read_only=True)

    class Meta:
        model = Certificat
        fields = [
            "id",
            "utilisateur",
            "utilisateur_nom",
            "parcours",
            "parcours_titre",
            "date_obtention",
            "code_verification",
        ]

    def get_utilisateur_nom(self, obj):
        return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"
