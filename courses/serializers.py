from rest_framework import serializers

from .models import Lecon, Parcours, Playground, Visualisation


class VisualisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualisation
        fields = ["id", "lecon", "type", "description"]


class PlaygroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playground
        fields = ["id", "lecon", "nom", "description"]


class LeconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = ["id", "parcours", "titre", "contenu", "duree"]


class ParcoursSerializer(serializers.ModelSerializer):
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Parcours
        fields = ["id", "slug", "titre", "description", "niveau", "administrateur", "apprenants", "lecons"]
