import json

from django.conf import settings
from django.core.management.base import BaseCommand

from courses.models import Lecon, Parcours
from quiz.models import Question, Quiz


class Command(BaseCommand):
    help = "Importe les données de départ (parcours, leçons, quiz) depuis les fichiers JSON exportés du frontend."

    def handle(self, *args, **options):
        base = settings.BASE_DIR

        with open(base / "seed_domain_courses.json", encoding="utf-8") as f:
            courses_data = json.load(f)
        with open(base / "seed_quizzes.json", encoding="utf-8") as f:
            quizzes_data = json.load(f)

        domain_meta = courses_data["domainMeta"]
        domain_courses = courses_data["domainCourses"]

        parcours_par_domaine = {}

        for domain_id, meta in domain_meta.items():
            parcours, created = Parcours.objects.update_or_create(
                slug=domain_id,
                defaults={"titre": meta["title"], "description": f"Parcours {meta['title']}", "niveau": meta["accent"]},
            )
            parcours_par_domaine[domain_id] = parcours
            self.stdout.write(f"{'Créé' if created else 'Mis à jour'} : Parcours « {meta['title']} »")

            premiere_lecon = None
            for course in domain_courses.get(domain_id, []):
                contenu = course["description"] + "\n\n" + "\n\n".join(course.get("pages", []))
                lecon, _ = Lecon.objects.update_or_create(
                    parcours=parcours,
                    titre=course["title"],
                    defaults={"contenu": contenu, "duree": len(course.get("pages", [])) * 10},
                )
                if premiere_lecon is None:
                    premiere_lecon = lecon
                self.stdout.write(f"  Leçon « {course['title']} »")

            quiz_data = quizzes_data.get(domain_id)
            if quiz_data and premiere_lecon:
                quiz, _ = Quiz.objects.update_or_create(
                    lecon=premiere_lecon,
                    defaults={"titre": quiz_data["title"], "score_minimum": 50},
                )
                Question.objects.filter(quiz=quiz).delete()
                for q in quiz_data["questions"]:
                    Question.objects.create(
                        quiz=quiz,
                        enonce=q["q"],
                        choix=q["options"],
                        reponse_correcte=q["options"][q["answer"]],
                    )
                self.stdout.write(f"  Quiz « {quiz_data['title']} » avec {len(quiz_data['questions'])} questions")

        self.stdout.write(self.style.SUCCESS("Import terminé."))
