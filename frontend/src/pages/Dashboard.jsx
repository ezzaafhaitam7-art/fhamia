import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Play, Search, Award, Download, LogOut, Heart, History } from "lucide-react";
import { domainMeta } from "../data/domainCourses";
import { api, getSession, clearSession } from "../api";
import NotificationBell from "../components/NotificationBell";
import FavoriteHeart from "../components/FavoriteHeart";
import MiniCalendar from "../components/MiniCalendar";
import { getActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const card = {
  background: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
};

const DOMAIN_IMAGES = {
  linux: "/images/domains/linux.jpg",
  reseaux: "/images/domains/reseaux.jpg",
  bdd: "/images/domains/bdd.jpg",
  ia: "/images/domains/ia.jpg",
};

function DomainIllustration({ slug }) {
  const src = DOMAIN_IMAGES[slug];
  if (src) {
    return <img src={src} alt="" style={{ width: "100%", height: 84, objectFit: "cover", display: "block" }} />;
  }
  return <div style={{ width: "100%", height: 84, background: BLUE_SOFT }} />;
}

export default function Dashboard() {
  const session = getSession();
  const navigate = useNavigate();
  const [progressions, setProgressions] = useState([]);
  const [parcoursList, setParcoursList] = useState([]);
  const [certificats, setCertificats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    if (!session) return;
    Promise.all([
      api.get("/quiz/progressions/"),
      api.get("/courses/parcours/"),
      api.get("/accounts/certificats/"),
    ])
      .then(([progs, parcours, certs]) => {
        setProgressions(progs.filter((p) => p.utilisateur === session.id));
        setParcoursList(parcours);
        setCertificats(certs.filter((c) => c.utilisateur === session.id));
      })
      .finally(() => setLoading(false));
  }, []);

  if (!session) return <Navigate to="/login" replace />;

  const progressFor = (parcoursId) => progressions.find((p) => p.parcours === parcoursId)?.pourcentage ?? 0;
  const enCours = progressions.find((p) => p.pourcentage < 100);
  const parcoursEnCours = enCours ? parcoursList.find((p) => p.id === enCours.parcours) : null;
  const metaEnCours = parcoursEnCours ? domainMeta[parcoursEnCours.slug] : null;

  const filteredParcours = search.trim()
    ? parcoursList.filter((p) => p.titre.toLowerCase().includes(search.trim().toLowerCase()))
    : parcoursList;

  const tutorConversations = (() => {
    try {
      const raw = localStorage.getItem(`fhamia-tutor-conversations-${session.id}`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const studiedDays = new Set(
    getActivity(session).map((entry) => {
      const d = new Date(entry.at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  const pointsTotal = progressions.reduce((sum, p) => sum + p.points, 0);
  const progressionMoyenne = progressions.length
    ? Math.round(progressions.reduce((sum, p) => sum + p.pourcentage, 0) / progressions.length)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</Link>
          <div style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500 }}>
            <Link to="/dashboard" style={{ color: BLUE, fontWeight: 700, borderBottom: `2px solid ${BLUE}`, paddingBottom: 4 }}>Mon apprentissage</Link>
            <Link to="/courses" style={{ color: SUB }}>Parcours</Link>
            <Link to="/favoris" style={{ color: SUB, display: "flex", alignItems: "center", gap: 5 }}><Heart size={14} /> Favoris</Link>
            <Link to="/historique" style={{ color: SUB, display: "flex", alignItems: "center", gap: 5 }}><History size={14} /> Historique</Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "8px 14px", width: 200 }}>
            <Search size={15} color={SUB} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un parcours…"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: INK, width: "100%" }}
            />
          </div>
          <NotificationBell certificats={certificats} progressions={progressions} conversations={tutorConversations} />
          <Link to="/profile" style={{ width: 36, height: 36, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
            {session.prenom?.[0]}{session.nom?.[0]}
          </Link>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${BORDER}`, color: SUB, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </nav>

      <main style={{ width: "100%", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...card, padding: 24, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: INK }}>Bonjour, {session.prenom} 👋</h1>
            <p style={{ fontSize: 13.5, color: SUB, margin: "0 0 14px" }}>
              {parcoursEnCours ? "Continuez votre apprentissage là où vous vous êtes arrêté." : "Choisissez un parcours pour commencer votre apprentissage."}
            </p>

            {parcoursEnCours && (
              <>
                <div style={{ background: BLUE_SOFT, borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 0.5 }}>Parcours actuel</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{Math.round(enCours.pourcentage)}% complété</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 8 }}>{parcoursEnCours.titre}</div>
                  <div style={{ height: 8, background: "#d7e3fb", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${enCours.pourcentage}%`, height: "100%", background: BLUE, borderRadius: 4 }} />
                  </div>
                </div>
                <Link
                  to={`/courses/${parcoursEnCours.slug}`}
                  className="landing-cta-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 10, marginBottom: 16 }}
                >
                  <Play size={15} fill="#fff" /> Continuer mon parcours
                </Link>
              </>
            )}

            {!loading && !parcoursEnCours && (
              <Link
                to="/courses"
                className="landing-cta-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 10, marginBottom: 16 }}
              >
                Voir les parcours
              </Link>
            )}

            <div style={{ display: "flex", gap: 20, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{progressions.length}</div>
                <div style={{ fontSize: 11, color: SUB }}>Parcours suivis</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{pointsTotal}</div>
                <div style={{ fontSize: 11, color: SUB }}>Points XP</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{progressionMoyenne}%</div>
                <div style={{ fontSize: 11, color: SUB }}>Progression moyenne</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{certificats.length}</div>
                <div style={{ fontSize: 11, color: SUB }}>Certificats</div>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: BLUE_SOFT, zIndex: 0 }} />
            <img
              src="/images/register-hero.png"
              alt="Illustration FhamIA"
              className="register-hero-float"
              style={{ width: "100%", maxWidth: 220, position: "relative", zIndex: 1 }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Explorer les parcours</h2>
              <Link to="/courses" style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>Voir tout</Link>
            </div>
            {filteredParcours.length === 0 && (
              <p style={{ fontSize: 13, color: SUB }}>Aucun parcours ne correspond à "{search}".</p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {filteredParcours.map((p) => {
                const pct = progressFor(p.id);
                return (
                  <div key={p.id} style={{ ...card, overflow: "hidden", position: "relative" }}>
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
                    <DomainIllustration slug={p.slug} />
                    <div style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: BLUE_SOFT, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                          {p.niveau}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pct > 0 ? BLUE : SUB }}>{Math.round(pct)}%</span>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: INK, marginBottom: 5, letterSpacing: -0.2 }}>{p.titre}</div>
                      <p style={{ fontSize: 12.5, color: SUB, lineHeight: 1.5, margin: "0 0 10px", minHeight: 36 }}>{p.description}</p>
                      <div style={{ height: 8, background: BORDER, borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: BLUE, borderRadius: 4 }} />
                      </div>
                      <Link
                        to={`/courses/${p.slug}`}
                        className="landing-cta-primary"
                        style={{ display: "block", textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px", borderRadius: 10 }}
                      >
                        Explorer
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0 }}>Certificats</h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: BLUE, padding: "3px 10px", borderRadius: 20 }}>
                {certificats.length} obtenu{certificats.length > 1 ? "s" : ""}
              </span>
            </div>
            {certificats.length === 0 && (
              <div style={{ textAlign: "center", padding: "16px 8px" }}>
                <div
                  style={{
                    margin: "0 auto 14px",
                    width: "100%",
                    maxWidth: 200,
                    borderRadius: 12,
                    border: `1.5px dashed #c7d5f2`,
                    background: BLUE_SOFT,
                    padding: "18px 14px",
                  }}
                >
                  <Award size={26} color="#9db3e0" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9db3e0", textTransform: "uppercase", letterSpacing: 0.6 }}>Certificat FhamIA</div>
                </div>
                <p style={{ fontSize: 12.5, color: SUB, margin: 0 }}>Termine un parcours à 100% pour obtenir ton premier certificat.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {certificats.map((c) => (
                <Link
                  key={c.id}
                  to={`/certificate/${c.id}`}
                  style={{ display: "block", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, background: `linear-gradient(135deg, ${BLUE_SOFT}, #fff)` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Award size={17} color="#fff" />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 0.5, border: `1px solid ${BLUE}`, borderRadius: 6, padding: "2px 6px" }}>
                      Vérifié
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 3 }}>{c.parcours_titre}</div>
                  <div style={{ fontSize: 11, color: SUB, marginBottom: 8 }}>
                    Obtenu le {new Date(c.date_obtention).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: BLUE }}>
                    <Download size={12} /> Télécharger
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <MiniCalendar studiedDays={studiedDays} />
          </div>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: "0 0 14px" }}>Votre progression</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {parcoursList.map((p) => {
              const pct = progressFor(p.id);
              const status = pct >= 100 ? "Terminé" : pct > 0 ? `En cours (${Math.round(pct)}%)` : "Non commencé";
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 130px", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, color: INK, fontWeight: 500 }}>{p.titre}</span>
                  <div style={{ height: 8, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: BLUE, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12.5, color: pct >= 100 ? INK : pct > 0 ? BLUE : SUB, fontWeight: pct > 0 ? 700 : 400, textAlign: "right" }}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: SUB }}>
          <strong style={{ color: INK }}>FhamIA</strong> &middot; &copy; 2026 FhamIA. Tous droits réservés.
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: SUB }}>
          <span>Confidentialité</span>
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
          <Link to="/support" style={{ color: SUB }}>Support</Link>
        </div>
      </footer>
    </div>
  );
}
