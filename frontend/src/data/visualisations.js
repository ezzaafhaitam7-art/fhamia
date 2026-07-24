export const visualisations = {
  linux: [
    { titre: "Arborescence Unix", description: "/ → /home, /etc, /var, /usr : chaque dossier a un rôle précis dans le système." },
    { titre: "Permissions rwx", description: "Chaque fichier a 3 groupes de droits (utilisateur, groupe, autres), chacun avec r (lecture), w (écriture), x (exécution)." },
    { titre: "Pipes et redirections", description: "commande1 | commande2 enchaîne deux commandes ; > et >> redirigent la sortie vers un fichier." },
  ],
  reseaux: [
    { titre: "Modèle OSI (7 couches)", description: "Physique → Liaison → Réseau → Transport → Session → Présentation → Application." },
    { titre: "Requête HTTP", description: "Client → DNS (résolution du nom) → Routeurs → Serveur → Réponse HTTP renvoyée au client." },
    { titre: "TCP vs UDP", description: "TCP : fiable, avec accusés de réception. UDP : rapide, sans garantie de livraison." },
  ],
  bdd: [
    { titre: "Modèle relationnel", description: "Des tables (lignes = tuples, colonnes = attributs) reliées entre elles par des clés primaires et étrangères." },
    { titre: "Jointures SQL", description: "INNER JOIN, LEFT JOIN, RIGHT JOIN : combinent des lignes de plusieurs tables selon une condition commune." },
    { titre: "Normalisation", description: "Organiser les données en plusieurs tables pour réduire la redondance et garantir la cohérence." },
  ],
  ia: [
    { titre: "Apprentissage supervisé vs non supervisé", description: "Supervisé : données étiquetées. Non supervisé : recherche de structures cachées (clustering)." },
    { titre: "Réseau de neurones", description: "Des couches de neurones artificiels transforment progressivement les données d'entrée en prédiction." },
    { titre: "Attention (Transformers)", description: "Chaque mot pondère son importance par rapport aux autres mots de la séquence pour construire son sens contextuel." },
  ],
};
