import re

import MySQLdb
from django.conf import settings

FORBIDDEN = re.compile(
    r"\b(GRANT|REVOKE|SHUTDOWN|FLUSH|CREATE\s+USER|DROP\s+DATABASE|DROP\s+SCHEMA|"
    r"LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE|SET\s+GLOBAL|USE\s)\b",
    re.IGNORECASE,
)

SEED_SQL = """
CREATE TABLE IF NOT EXISTS auteurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  pays VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  auteur_id INT,
  annee INT,
  FOREIGN KEY (auteur_id) REFERENCES auteurs(id)
);
"""

SEED_DATA_SQL = """
INSERT INTO auteurs (nom, pays) VALUES
  ('Fatima Zahra', 'Maroc'),
  ('Ahmed Bensouda', 'Maroc'),
  ('Leïla Amrani', 'France');

INSERT INTO livres (titre, auteur_id, annee) VALUES
  ('Introduction au SQL', 1, 2020),
  ('Bases de Données Relationnelles', 1, 2021),
  ('Le Web Moderne', 2, 2019),
  ('Intelligence Artificielle Appliquée', 3, 2022);
"""


def _db_config():
    return settings.DATABASES["default"]


def sandbox_db_name(utilisateur_id):
    return f"sandbox_user_{utilisateur_id}"


def _connect(db=None):
    cfg = _db_config()
    kwargs = {
        "host": cfg["HOST"],
        "port": int(cfg["PORT"]),
        "user": cfg["USER"],
        "passwd": cfg["PASSWORD"],
        "charset": "utf8mb4",
    }
    if db:
        kwargs["db"] = db
    return MySQLdb.connect(**kwargs)


def ensure_sandbox(utilisateur_id, reset=False):
    name = sandbox_db_name(utilisateur_id)
    conn = _connect()
    cur = conn.cursor()
    if reset:
        cur.execute(f"DROP DATABASE IF EXISTS `{name}`")
    cur.execute("SHOW DATABASES LIKE %s", (name,))
    already_exists = cur.fetchone() is not None
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{name}` CHARACTER SET utf8mb4")
    conn.commit()
    cur.close()
    conn.close()

    if reset or not already_exists:
        conn = _connect(db=name)
        cur = conn.cursor()
        for statement in SEED_SQL.strip().split(";"):
            if statement.strip():
                cur.execute(statement)
        for statement in SEED_DATA_SQL.strip().split(";"):
            if statement.strip():
                cur.execute(statement)
        conn.commit()
        cur.close()
        conn.close()


def execute_sql(utilisateur_id, sql):
    if FORBIDDEN.search(sql):
        raise ValueError("Cette instruction n'est pas autorisée dans le bac à sable SQL.")

    name = sandbox_db_name(utilisateur_id)
    ensure_sandbox(utilisateur_id)

    conn = _connect(db=name)
    cur = conn.cursor()
    try:
        cur.execute(sql)
        if cur.description:
            columns = [d[0] for d in cur.description]
            rows = [list(row) for row in cur.fetchall()]
            result = {"columns": columns, "rows": rows}
        else:
            conn.commit()
            result = {"columns": [], "rows": [], "affected": cur.rowcount}
    finally:
        cur.close()
        conn.close()

    return result
