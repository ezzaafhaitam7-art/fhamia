import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Search, Award, BookOpen, ArrowRight } from "lucide-react";
import { api, getSession } from "../api";
import BackButton from "../components/BackButton";
import FavoriteHeart from "../components/FavoriteHeart";
import { logActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const DOMAIN_IMAGES = {
  linux: "/images/domains/linux.jpg",
  reseaux: "/images/domains/reseaux.jpg",
  bdd: "/images/domains/bdd.jpg",
  ia: "/images/domains/ia.jpg",
};

export function BigIllustration({ slug, height = 420 }) {
  const src = DOMAIN_IMAGES[slug];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="landing-course-img"
        style={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <div style={{ width: "100%", height, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Award size={40} color={BLUE} />
    </div>
  );
}

export default function Courses() {
  const navigate = useNavigate();
  const [parcoursList, setParcoursList] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuing, setIssuing] = useState(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState("Tous");

  const session = getSession();

  const load = () => {
    Promise.all([
      api.get("/courses/parcours/"),
      session ? api.get("/quiz/progressions/").catch(() => []) : Promise.resolve([]),
    ])
      .then(([parcours, progs]) => {
        setParcoursList(parcours);
        setProgressions(progs.filter((p) => p.utilisateur === session?.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDemarrer = (parcoursSlug) => {
    if (!session) return;
    api.post(`/courses/parcours/${parcoursSlug}/suivre/`, { utilisateur: session.id }).catch(() => {});
  };

  const handleObtenirCertificat = async (parcoursId) => {
    setIssuing(parcoursId);
    try {
      const certificat = await api.post("/accounts/obtenir-certificat/", { utilisateur: session.id, parcours: parcoursId });
      logActivity(session, { type: "certificat", title: "Certificat obtenu", description: certificat.parcours_titre });
      navigate(`/certificate/${certificat.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setIssuing(null);
    }
  };

  const filtered = useMemo(
    () =>
      parcoursList.filter(
        (p) => (filter === "Tous" || p.titre === filter) && p.titre.toLowerCase().includes(search.toLowerCase())
      ),
    [parcoursList, filter, search]
  );

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/dashboard" />
          <Menu size={20} color={INK} />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "28px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px", color: INK }}>Tous les parcours</h1>
          <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
            Choisissez un parcours et développez vos compétences grâce à une expérience d'apprentissage interactive.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 100, padding: "12px 20px", maxWidth: 560 }}>
          <Search size={17} color="#9CA3AF" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un parcours…"
            style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "none", color: INK }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Tous", ...new Set(parcoursList.map((p) => p.titre))].map((label) => {
            const active = filter === label;
            return (
              <button
                key={label}
                onClick={() => setFilter(label)}
                className="chip-hover"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 100,
                  border: active ? "none" : `1px solid ${BORDER}`,
                  background: active ? BLUE : "#fff",
                  color: active ? "#fff" : SUB,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading && <p style={{ color: SUB, fontSize: 14 }}>Chargement des parcours…</p>}
        {error && <p style={{ color: "#ba1a1a", fontSize: 14 }}>{error}</p>}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {filtered.map((p) => {
              const progression = progressions.find((pr) => pr.parcours === p.id);
              const progress = progression ? Math.round(progression.pourcentage) : 0;
              const dejaSuivi = session ? p.apprenants.includes(session.id) : false;
              return (
                <div key={p.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                    <FavoriteHeart
                      item={{
                        id: `parcours-${p.id}`,
                        type: "parcours",
                        title: p.titre,
                        subtitle: p.description,
                        to: `/courses/${p.slug}`,
                      }}
                    />
                  </div>
                  <BigIllustration slug={p.slug} />
                  {progress > 0 && (
                    <div style={{ height: 4, background: BORDER }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: BLUE }} />
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: -0.3 }}>{p.titre}</h2>
                      <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: BLUE_SOFT, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {p.niveau}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 640 }}>{p.description}</p>
                    <div style={{ display: "flex", gap: 20, marginBottom: 20, fontSize: 13, color: SUB }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <BookOpen size={15} color={BLUE} /> {p.lecons.length} leçon{p.lecons.length > 1 ? "s" : ""}
                      </span>
                      {progress > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, color: BLUE, fontWeight: 700 }}>
                          {progress}% complété
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          handleDemarrer(p.slug);
                          navigate(`/courses/${p.slug}`);
                        }}
                        className="landing-cta-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 26px", borderRadius: 10, border: "none" }}
                      >
                        {dejaSuivi || progress > 0 ? "Continuer" : "Explorer"} le parcours <ArrowRight size={16} />
                      </button>
                      {session && progress === 100 && (
                        <button
                          onClick={() => handleObtenirCertificat(p.id)}
                          disabled={issuing === p.id}
                          className="btn-outline-hover"
                          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1.5px solid ${BLUE}`, color: BLUE, fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 10, opacity: issuing === p.id ? 0.6 : 1 }}
                        >
                          <Award size={15} /> {issuing === p.id ? "…" : "Obtenir le certificat"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ color: SUB, fontSize: 14 }}>Aucun parcours ne correspond à ta recherche.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
