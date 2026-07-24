import { TerminalSquare, Network, Database, Brain } from "lucide-react";

export const courses = [
  {
    id: "linux",
    icon: TerminalSquare,
    bgIcon: TerminalSquare,
    level: "Débutant",
    title: "Linux & Terminal",
    description:
      "Apprends à dompter la ligne de commande et l'administration système comme un pro.",
    progress: 45,
    lessons: "12/24 Leçons",
    cta: "Continuer",
    accent: "cyan",
  },
  {
    id: "reseaux",
    icon: Network,
    bgIcon: Network,
    level: "Intermédiaire",
    title: "Réseaux & Protocoles",
    description:
      "TCP/IP, couches OSI et sécurité : comprends comment le monde est interconnecté.",
    progress: 15,
    lessons: "4/38 Leçons",
    cta: "Continuer",
    accent: "purple",
  },
  {
    id: "bdd",
    icon: Database,
    bgIcon: Database,
    level: "Avancé",
    title: "Bases de Données",
    description:
      "Maîtrise SQL et NoSQL pour structurer les données des applications modernes.",
    progress: 0,
    lessons: "0/18 Leçons",
    cta: "Démarrer",
    accent: "cyan",
  },
  {
    id: "ia",
    icon: Brain,
    bgIcon: Brain,
    level: "Parcours Phare",
    title: "Intelligence Artificielle",
    description:
      "Plonge dans le futur : du Machine Learning aux LLMs appliqués au contexte local.",
    progress: 75,
    lessons: "28/35 Leçons",
    cta: "Continuer le parcours →",
    accent: "cyan",
    featured: true,
  },
];
