import re

DARIJA_MARKERS = {
    "bghit", "bghiti", "bghina", "bghyt", "bghyti",
    "chno", "chnou", "chnahowa", "chnahiya", "chnahia", "achno", "achnou", "ashno", "ashnou",
    "kifach", "kif", "kifash", "kidayer", "kidaayer", "kidayra",
    "wach", "wash", "wshkoun", "chkoun", "chkon", "chkoun",
    "dyal", "dial", "dyalek", "dyali", "dyalna", "dyalek", "dyalha", "dyalo", "dyalhom",
    "hna", "hnaya", "temma",
    "hada", "hadi", "hadchi", "had", "hadchi",
    "3ndi", "3andi", "3ndk", "3ndna", "3ndkom", "3ndo", "3ndha",
    "3lach", "3la", "3lash", "3lah",
    "mzyan", "mezyan", "zwina", "zwin",
    "wakha", "safi", "daba", "dorka",
    "ghadi", "ghadya", "ghanmshi", "ghatmshi",
    "makayn", "makaynch", "kayn", "kayna", "kaynin",
    "bzaf", "bezzaf", "chwiya", "chi",
    "walo", "walou",
    "nta", "nti", "ntouma", "ntina",
    "rah", "rani", "rak", "raki", "rahom",
    "3arf", "3arfa", "n3ref", "n3rf", "3ref",
    "fin", "finma", "imta", "imtah",
    "howa", "hiya", "hia", "houwa", "hiyya",
    "ana", "hadak", "hadik", "douk", "dokchi",
    "3afak", "afak", "smh", "smhli",
    "labas", "bikhir",
    "khoya", "khti", "sahbi",
    "yallah", "yalah", "wllah", "wallah",
    "ghir", "bhal", "bhal7al", "bach",
    # mots de liaison très fréquents en darija latin, rares/absents en
    # français isolé (utile pour capter des phrases mixtes darija/latin)
    "lfarq", "lfar9", "farq", "far9", "bin", "bine",
    "wla", "awla", "ola",
    "3la9a", "3laqa",
    "kayeb9a", "yb9a", "b9a",
    "ndir", "dir", "diha", "dirha", "3malha", "3mel",
    "chhal", "chhal", "cha7al",
    "mnin", "mnayn",
    "wa9t", "waqt",
}

ARABIC_SCRIPT_RE = re.compile(r"[؀-ۿ]")

# Demande explicite de réponse en darija, même si le message est écrit en
# français (ex: "réponds-moi en darija marocaine de c'est quoi...").
DARIJA_REQUEST_RE = re.compile(
    r"\b(en|b|bel|f)\s*darija\b|\bdarija\s*marocaine\b|\ben\s*arabe\s*marocain\b",
    re.IGNORECASE,
)

SMALLTALK_PHRASES = {
    "hello", "hi", "salut", "bonjour", "bonsoir", "bnjour", "slt", "coucou",
    "salam", "salamo", "salamalikoum", "cv", "ca va", "yo", "hey", "merci",
    "shukran", "thanks", "ok", "okay", "d'accord", "daccord",
}


def is_darija(text):
    if ARABIC_SCRIPT_RE.search(text):
        return True

    if DARIJA_REQUEST_RE.search(text):
        return True

    words = re.findall(r"[a-zA-Z0-9']+", text.lower())
    return any(word in DARIJA_MARKERS for word in words)


def is_smalltalk(text):
    normalized = re.sub(r"[^a-z0-9' ]", "", text.lower()).strip()
    if not normalized:
        return False
    words = normalized.split()
    return len(words) <= 4 and normalized in SMALLTALK_PHRASES or (
        len(words) <= 2 and all(w in SMALLTALK_PHRASES for w in words)
    )
