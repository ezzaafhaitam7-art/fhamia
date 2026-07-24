import posixpath

from .models import FichierVirtuel

DEFAULT_STRUCTURE = [
    ("/home", "dir", ""),
    ("/home/user", "dir", ""),
    ("/home/user/documents", "dir", ""),
    ("/home/user/documents/notes.txt", "file", "Penser à réviser les commandes chmod et chown."),
    ("/home/user/photos", "dir", ""),
    ("/home/user/readme.txt", "file", "Bienvenue dans ton terminal Linux d'entraînement."),
    ("/etc", "dir", ""),
    ("/etc/config.conf", "file", "user=user\nshell=/bin/bash"),
    ("/var", "dir", ""),
    ("/var/log", "dir", ""),
]

USERNAME = "user"
HOSTNAME = "fhamia"


def ensure_seeded(utilisateur):
    if FichierVirtuel.objects.filter(utilisateur=utilisateur).exists():
        return
    FichierVirtuel.objects.bulk_create(
        [
            FichierVirtuel(utilisateur=utilisateur, chemin=chemin, type=type_, contenu=contenu)
            for chemin, type_, contenu in DEFAULT_STRUCTURE
        ]
    )


def resolve_path(cwd, target):
    if not target or target == ".":
        return cwd
    if target == "~":
        return "/home/user"
    if target.startswith("/"):
        base = "/"
    else:
        base = cwd
    return posixpath.normpath(posixpath.join(base, target))


def get_node(utilisateur, chemin):
    if chemin == "/":
        return {"chemin": "/", "type": "dir"}
    try:
        node = FichierVirtuel.objects.get(utilisateur=utilisateur, chemin=chemin)
        return {"chemin": node.chemin, "type": node.type, "contenu": node.contenu}
    except FichierVirtuel.DoesNotExist:
        return None


def list_children(utilisateur, chemin):
    prefix = chemin if chemin != "/" else ""
    nodes = FichierVirtuel.objects.filter(utilisateur=utilisateur, chemin__startswith=prefix + "/")
    names = set()
    for node in nodes:
        rest = node.chemin[len(prefix) + 1 :]
        if "/" not in rest:
            names.add((rest, node.type))
    return sorted(names)


def run_command(raw, utilisateur, cwd):
    ensure_seeded(utilisateur)
    parts = raw.strip().split()
    if not parts:
        return {"output": "", "cwd": cwd}

    cmd, args = parts[0], parts[1:]

    if cmd == "pwd":
        return {"output": cwd, "cwd": cwd}

    if cmd == "whoami":
        return {"output": USERNAME, "cwd": cwd}

    if cmd == "hostname":
        return {"output": HOSTNAME, "cwd": cwd}

    if cmd == "clear":
        return {"output": "__CLEAR__", "cwd": cwd}

    if cmd == "help":
        return {
            "output": "Commandes disponibles : pwd, ls, cd, cat, mkdir, touch, rm, echo, whoami, hostname, clear, help",
            "cwd": cwd,
        }

    if cmd == "ls":
        target = resolve_path(cwd, args[0] if args else ".")
        node = get_node(utilisateur, target)
        if not node or node["type"] != "dir":
            return {"output": f"ls: impossible d'accéder à '{args[0] if args else '.'}': Aucun fichier ou dossier de ce type", "cwd": cwd}
        children = list_children(utilisateur, target)
        names = [f"{name}/" if t == "dir" else name for name, t in children]
        return {"output": "  ".join(names), "cwd": cwd}

    if cmd == "cd":
        target = resolve_path(cwd, args[0] if args else "~")
        node = get_node(utilisateur, target)
        if not node or node["type"] != "dir":
            return {"output": f"bash: cd: {args[0] if args else '~'}: Aucun fichier ou dossier de ce type", "cwd": cwd}
        return {"output": "", "cwd": target}

    if cmd == "cat":
        if not args:
            return {"output": "cat: opérande manquant", "cwd": cwd}
        target = resolve_path(cwd, args[0])
        node = get_node(utilisateur, target)
        if not node:
            return {"output": f"cat: {args[0]}: Aucun fichier ou dossier de ce type", "cwd": cwd}
        if node["type"] == "dir":
            return {"output": f"cat: {args[0]}: est un dossier", "cwd": cwd}
        return {"output": node["contenu"], "cwd": cwd}

    if cmd == "mkdir":
        if not args:
            return {"output": "mkdir: opérande manquant", "cwd": cwd}
        target = resolve_path(cwd, args[0])
        if get_node(utilisateur, target):
            return {"output": f"mkdir: impossible de créer le dossier '{args[0]}': Le fichier existe", "cwd": cwd}
        FichierVirtuel.objects.create(utilisateur=utilisateur, chemin=target, type="dir", contenu="")
        return {"output": "", "cwd": cwd}

    if cmd == "touch":
        if not args:
            return {"output": "touch: opérande manquant", "cwd": cwd}
        target = resolve_path(cwd, args[0])
        if not get_node(utilisateur, target):
            FichierVirtuel.objects.create(utilisateur=utilisateur, chemin=target, type="file", contenu="")
        return {"output": "", "cwd": cwd}

    if cmd == "rm":
        if not args:
            return {"output": "rm: opérande manquant", "cwd": cwd}
        target = resolve_path(cwd, args[0])
        node = FichierVirtuel.objects.filter(utilisateur=utilisateur, chemin=target).first()
        if not node:
            return {"output": f"rm: impossible de supprimer '{args[0]}': Aucun fichier ou dossier de ce type", "cwd": cwd}
        node.delete()
        return {"output": "", "cwd": cwd}

    if cmd == "echo":
        return {"output": " ".join(args), "cwd": cwd}

    return {"output": f"bash: {cmd}: commande introuvable", "cwd": cwd}
