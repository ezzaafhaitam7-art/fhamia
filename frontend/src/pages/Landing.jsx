import { Link } from "react-router-dom";
import {
  Award,
  Rocket,
  Users,
  Bot,
  UserPlus,
  ClipboardCheck,
  Route,
  PlayCircle,
  Trophy,
  BadgeCheck,
  TerminalSquare,
  Network,
  Database,
  Brain,
  ArrowRight,
  ChevronDown,
  Sparkle,
  Box,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";

const BLUE = "#0056D2";
const INK = "#1f1f1f";
const SUB = "#5b6670";
const BORDER = "#e3e6ea";
const BG_SOFT = "#f6f8fb";

/* ---------- scroll reveal ---------- */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`landing-reveal ${visible ? "landing-reveal-visible" : ""}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ---------- mockup UI thumbnails (real feature previews, no stock photos) ---------- */

function MockupThumb({ variant, height = 130, icon }) {
  const frame = {
    width: "100%",
    height,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };
  const header = (
    <div className="landing-mockup-dots" style={{ padding: "8px 10px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
      <span /><span /><span />
    </div>
  );

  if (variant === "linux") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div className="landing-terminal" style={{ flex: 1, padding: "10px 12px", fontSize: 11.5, lineHeight: 1.7 }}>
          <div>user@fhamia:~$ ls</div>
          <div style={{ color: "#9aa4bf" }}>documents  photos  readme.txt</div>
          <div>user@fhamia:~$ mkdir projets</div>
          <div>user@fhamia:~$ cat readme.txt</div>
          <div style={{ color: "#9aa4bf" }}>Bienvenue dans ton terminal.</div>
        </div>
      </div>
    );
  }

  if (variant === "sql") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, padding: "10px 12px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: BLUE, marginBottom: 8 }}>
            SELECT * FROM livres JOIN auteurs;
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 10.5 }}>
            {["titre", "auteur", "Intro SQL", "F. Zahra", "BD Relationnelles", "F. Zahra", "Web Moderne", "A. Bensouda"].map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "4px 6px",
                  background: i < 2 ? "#e8f0fe" : "#fff",
                  border: `1px solid ${BORDER}`,
                  fontWeight: i < 2 ? 700 : 400,
                  color: i < 2 ? BLUE : INK,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "network") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, background: "linear-gradient(135deg, #eaf1fd, #f8fafd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 200 90" style={{ width: "88%", height: "82%" }}>
            <line x1="30" y1="45" x2="100" y2="20" stroke={BLUE} strokeWidth="2.5" />
            <line x1="30" y1="45" x2="100" y2="70" stroke={BLUE} strokeWidth="2.5" />
            <line x1="100" y1="20" x2="170" y2="45" stroke={BLUE} strokeWidth="2.5" />
            <line x1="100" y1="70" x2="170" y2="45" stroke={BLUE} strokeWidth="2.5" />
            <circle cx="30" cy="45" r="11" fill="#fff" stroke={BLUE} strokeWidth="2.5" />
            <circle cx="100" cy="20" r="9" fill="#fff" stroke={BLUE} strokeWidth="2.5" />
            <circle cx="100" cy="70" r="9" fill="#fff" stroke={BLUE} strokeWidth="2.5" />
            <circle cx="170" cy="45" r="11" fill={BLUE} stroke={BLUE} strokeWidth="2.5" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === "threeD") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, background: "linear-gradient(135deg, #eaf1fd, #f8fafd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 100 90" width="76" height="70">
            <polygon points="50,4 95,27 95,67 50,90 5,67 5,27" fill="none" stroke={BLUE} strokeWidth="2" />
            <polygon points="50,4 95,27 50,50 5,27" fill="#cfe0fc" stroke={BLUE} strokeWidth="2" />
            <polygon points="50,50 95,27 95,67 50,90" fill={BLUE} stroke={BLUE} strokeWidth="2" opacity="0.85" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === "tutor") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ alignSelf: "flex-end", background: BLUE, color: "#fff", fontSize: 10.5, padding: "6px 10px", borderRadius: "10px 10px 2px 10px", maxWidth: "75%" }}>
            C'est quoi une clé primaire ?
          </div>
          <div style={{ alignSelf: "flex-start", background: "#fff", border: `1px solid ${BORDER}`, fontSize: 10.5, padding: "6px 10px", borderRadius: "10px 10px 10px 2px", maxWidth: "80%" }}>
            Un identifiant unique pour chaque ligne...
          </div>
        </div>
      </div>
    );
  }

  if (variant === "certificate") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ border: `1.5px solid ${BLUE}`, borderRadius: 8, padding: "10px 18px", textAlign: "center", background: "#fff" }}>
            <ShieldCheck size={18} color={BLUE} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: 0.5, textTransform: "uppercase" }}>Certificat</div>
            <div style={{ fontSize: 8, color: SUB, fontFamily: "var(--mono)" }}>FH-05F04FFED6</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "progress") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          {[["Linux & Terminal", 100], ["Réseaux", 65], ["Bases de Données", 30]].map(([label, pct]) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: SUB, marginBottom: 3 }}>
                <span>{label}</span><span>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "#e3e6ea", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: BLUE, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "quiz") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, padding: "12px 14px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: INK, marginBottom: 8 }}>Quel est le rôle d'une clé étrangère ?</div>
          {["Trier les colonnes", "Relier deux tables", "Chiffrer les données"].map((opt, i) => (
            <div
              key={opt}
              style={{
                fontSize: 10,
                padding: "5px 8px",
                marginBottom: 4,
                borderRadius: 5,
                border: `1px solid ${i === 1 ? BLUE : BORDER}`,
                background: i === 1 ? "#e8f0fe" : "#fff",
                color: i === 1 ? BLUE : INK,
                fontWeight: i === 1 ? 700 : 400,
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "community") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: -8 }}>
          {["#0056D2", "#3b7ef0", "#7db3ff", "#bfd9ff"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: c,
                border: "2px solid #fff",
                marginLeft: i === 0 ? 0 : -10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Users size={14} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "darija") {
    return (
      <div style={frame} className="landing-mockup landing-course-img">
        {header}
        <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: INK, direction: "rtl", fontWeight: 600 }}>شنو هي قاعدة البيانات؟</div>
          <div style={{ height: 1, background: BORDER }} />
          <div style={{ fontSize: 10.5, color: SUB }}>≈ "C'est quoi une base de données ?"</div>
        </div>
      </div>
    );
  }

  // pdf
  const PdfIcon = icon || FileText;
  return (
    <div style={frame} className="landing-mockup landing-course-img">
      {header}
      <div style={{ flex: 1, background: "linear-gradient(135deg, #eaf1fd, #f8fafd)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PdfIcon size={21} color="#fff" />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ height: 7, width: "88%", background: "#bcd2f7", borderRadius: 3 }} />
          <div style={{ height: 7, width: "62%", background: "#bcd2f7", borderRadius: 3 }} />
          <div style={{ height: 7, width: "74%", background: "#bcd2f7", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- data ---------- */

const domains = [
  { id: "linux", icon: TerminalSquare, title: "Linux & Terminal", text: "Maîtrise le shell comme un admin système.", mockup: "linux" },
  { id: "reseaux", icon: Network, title: "Réseaux & Protocoles", text: "TCP/IP, OSI, sous-réseaux en pratique.", mockup: "network" },
  { id: "bdd", icon: Database, title: "Bases de Données", text: "SQL réel sur ta propre base MySQL.", mockup: "sql" },
  { id: "ia", icon: Brain, title: "Intelligence Artificielle", text: "Du Machine Learning aux LLMs modernes.", mockup: "threeD" },
];

const courseCards = [
  { id: "linux", title: "Linux & Terminal", description: "Maîtrise la ligne de commande et l'administration système comme un pro.", level: "Débutant", lessons: 3, mockup: "pdf", icon: TerminalSquare },
  { id: "reseaux", title: "Réseaux & Protocoles", description: "TCP/IP, modèle OSI et sécurité : comprends comment le monde est interconnecté.", level: "Intermédiaire", lessons: 3, mockup: "pdf", icon: Network },
  { id: "bdd", title: "Bases de Données", description: "SQL, NoSQL et modélisation relationnelle pour structurer de vraies applications.", level: "Avancé", lessons: 3, mockup: "pdf", icon: Database },
  { id: "ia", title: "Intelligence Artificielle", description: "Du Machine Learning aux LLMs modernes, appliqués au contexte marocain.", level: "Tous niveaux", lessons: 3, mockup: "pdf", icon: Brain },
];

const whyItems = [
  { icon: Bot, title: "Tuteur IA en Darija", text: "Pose tes questions en Darija ou en français, avec des réponses ancrées dans le contenu réel des cours.", mockup: "darija" },
  { icon: Box, title: "Playgrounds interactifs", text: "Un vrai terminal, une vraie base SQL, un vrai calculateur réseau — pas des simulations en façade.", mockup: "linux" },
  { icon: Award, title: "Certifications vérifiables", text: "Obtiens un certificat avec code de vérification unique une fois ton parcours terminé à 100%.", mockup: "certificate" },
  { icon: Rocket, title: "Suivi de progression réel", text: "Visualise ton avancement exact, parcours par parcours, pas une barre décorative.", mockup: "progress" },
  { icon: Sparkle, title: "Visualisations 3D", text: "Manipule des concepts abstraits (réseaux, bases de données, IA) en 3D interactive.", mockup: "threeD" },
  { icon: Users, title: "Communauté active", text: "Rejoins des apprenants marocains passionnés de technologie.", mockup: "community" },
];

const steps = [
  { icon: UserPlus, label: "Inscription", text: "Crée ton profil en une minute, sans carte bancaire." },
  { icon: Route, label: "Choix du parcours", text: "Linux, Réseaux, Bases de données ou IA — à toi de choisir." },
  { icon: PlayCircle, label: "Apprentissage actif", text: "Cours, quiz notés et playgrounds réels pour pratiquer." },
  { icon: ClipboardCheck, label: "Tuteur IA à la demande", text: "Pose tes questions en français ou en darija, 24/7." },
  { icon: Trophy, label: "Suivi de progression", text: "Visualise ton avancement réel, parcours par parcours." },
  { icon: BadgeCheck, label: "Certification", text: "Télécharge et partage ton certificat vérifiable." },
];

const faqs = [
  {
    q: "Est-ce que FhamIA est vraiment gratuit ?",
    a: "Oui, l'intégralité de la plateforme est gratuite : les cours, les quiz notés, les playgrounds pratiques (terminal, SQL, réseau, IA) et le tuteur intelligent. Aucune carte bancaire n'est demandée à l'inscription, et il n'y a pas de palier payant caché derrière une fonctionnalité premium.",
  },
  {
    q: "Le tuteur IA répond-il vraiment en darija ?",
    a: "Oui. Le tuteur détecte automatiquement si ta question est posée en français ou en darija, puis répond dans la même langue. Contrairement à un chatbot générique, il ne répond pas au hasard : il cherche d'abord la réponse dans le contenu réel des supports de cours avant de formuler une explication, et cite ses sources.",
  },
  {
    q: "Le certificat a-t-il une valeur officielle ?",
    a: "C'est un certificat de complétion propre à la plateforme FhamIA, avec un code de vérification unique et une date d'obtention réelle liée à ta progression. Ce n'est pas un diplôme accrédité par un ministère ou une université — c'est une preuve honnête que tu as terminé un parcours à 100%, pas plus.",
  },
  {
    q: "Ai-je besoin de connaissances préalables ?",
    a: "Non. Chaque parcours part des bases et monte progressivement en difficulté. Le niveau requis (Débutant, Intermédiaire ou Avancé) est clairement indiqué sur chaque carte de cours, pour que tu puisses choisir en connaissance de cause.",
  },
  {
    q: "Puis-je pratiquer sans juste regarder des vidéos ?",
    a: "Oui, c'est même le cœur de FhamIA. Chaque domaine a un playground réel et fonctionnel : un vrai terminal Linux avec persistance de tes fichiers, une vraie base de données MySQL personnelle pour tester du SQL, un calculateur de sous-réseaux qui fait de vrais calculs, et un espace pour dialoguer avec un vrai modèle d'intelligence artificielle.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="landing-faq-item" style={{ padding: "0 12px" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          borderBottom: open ? "none" : `1px solid ${BORDER}`,
          textAlign: "left",
          padding: "18px 0",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
          color: INK,
        }}
      >
        <span className="landing-faq-q" style={{ transition: "color 0.3s ease" }}>{q}</span>
        <ChevronDown size={18} color={SUB} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", flexShrink: 0, marginLeft: 12 }} />
      </button>
      {open && <p style={{ margin: "0 0 18px", fontSize: 14, color: SUB, lineHeight: 1.6, borderBottom: `1px solid ${BORDER}`, paddingBottom: 18 }}>{a}</p>}
    </div>
  );
}

/* ---------- floating chip config for hero ---------- */

const heroChips = [
  { key: "tutor", top: "2%", left: "0%", w: 150, rot: -4, dur: 5.2, delay: 0 },
  { key: "linux", top: "6%", left: "60%", w: 150, rot: 3, dur: 6, delay: 0.4 },
  { key: "sql", top: "68%", left: "-4%", w: 150, rot: 3, dur: 5.6, delay: 0.8 },
  { key: "network", top: "72%", left: "58%", w: 140, rot: -3, dur: 5.4, delay: 1.1 },
  { key: "certificate", top: "0%", left: "32%", w: 120, rot: -2, dur: 6.4, delay: 0.2 },
  { key: "quiz", top: "38%", left: "-10%", w: 130, rot: 4, dur: 5.8, delay: 1.4 },
  { key: "progress", top: "40%", left: "70%", w: 140, rot: -3, dur: 6.2, delay: 0.6 },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: INK, fontFamily: "inherit" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 48px",
          borderBottom: `1px solid ${BORDER}`,
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: "inline-block" }}>
          <Logo size={20} color={BLUE} />
        </Link>
        <div style={{ display: "flex", gap: 36, fontSize: 14, color: INK, fontWeight: 500 }}>
          <a href="#accueil" className="landing-nav-link">Accueil</a>
          <a href="#pourquoi" className="landing-nav-link">Pourquoi nous</a>
          <Link to="/courses" className="landing-nav-link">Parcours</Link>
          <a href="#faq" className="landing-nav-link">FAQ</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/login" className="landing-nav-link" style={{ fontSize: 14, fontWeight: 600, color: BLUE }}>Connexion</Link>
          <Link
            to="/register"
            className="landing-cta-primary"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "10px 20px", borderRadius: 6, display: "inline-block" }}
          >
            Inscrivez-vous gratuitement
          </Link>
        </div>
      </nav>

      <section
        id="accueil"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          alignItems: "center",
          gap: 40,
          padding: "88px 48px 100px",
          maxWidth: 1280,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div className="landing-hero-bg">
          <div className="landing-hero-grid" />
          <div className="landing-hero-blob b1" />
          <div className="landing-hero-blob b2" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="landing-particle"
              style={{
                left: `${10 + i * 15}%`,
                bottom: `${5 + (i % 3) * 12}%`,
                animationDelay: `${i * 1.4}s`,
              }}
            />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 16 }}>
            FhamIA
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(120deg, ${BLUE}, #3b7ef0)`,
              padding: "8px 16px",
              borderRadius: 20,
              marginBottom: 26,
              letterSpacing: 0.3,
              boxShadow: "0 8px 18px -8px rgba(0,86,210,0.55)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7ee787", display: "inline-block" }} />
            100% gratuit &middot; Aucune carte bancaire
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.12, fontWeight: 700, margin: "0 0 24px", color: INK, letterSpacing: -0.5 }}>
            Apprends <span className="landing-gradient-text">l'IA, Linux, les Réseaux</span> et les Bases de Données, gratuitement
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: SUB, margin: "0 0 36px", maxWidth: 520 }}>
            Cours en PDF interactifs, tuteur IA en français et en darija, playgrounds réels
            (terminal, SQL, réseau), visualisations 3D, quiz notés, suivi de progression et
            certificats vérifiables — une seule plateforme, zéro vidéo passive.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              to="/register"
              className="landing-cta-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 28px", borderRadius: 6 }}
            >
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <Link
              to="/courses"
              className="landing-cta-outline"
              style={{ fontSize: 15, fontWeight: 700, border: `1.5px solid ${BLUE}`, borderRadius: 6, padding: "13.5px 24px", display: "inline-block" }}
            >
              Voir les parcours
            </Link>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="landing-hero-stage">
            <div className="landing-hero-laptop">
              <div style={{ background: "#e9edf3", padding: "7px 10px", display: "flex", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff6159" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffbd2e" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c941" }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 10 }}>Bonjour Hamza 👋</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div style={{ background: "#e8f0fe", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>4</div>
                    <div style={{ fontSize: 8, color: SUB }}>Parcours</div>
                  </div>
                  <div style={{ background: "#e8f0fe", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>65%</div>
                    <div style={{ fontSize: 8, color: SUB }}>Progression</div>
                  </div>
                </div>
                <div style={{ height: 6, background: "#eef1f5", borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 6, width: "80%", background: "#eef1f5", borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 6, width: "60%", background: "#eef1f5", borderRadius: 3 }} />
              </div>
            </div>

            {heroChips.map((chip) => (
              <div
                key={chip.key}
                className="landing-float-chip"
                style={{
                  top: chip.top,
                  left: chip.left,
                  width: chip.w,
                  borderRadius: 12,
                  boxShadow: "0 14px 26px -12px rgba(0,86,210,0.25)",
                  border: `1px solid ${BORDER}`,
                  "--chip-rot": `${chip.rot}deg`,
                  animationDuration: `${chip.dur}s`,
                  animationDelay: `${chip.delay}s`,
                }}
              >
                <MockupThumb variant={chip.key} height={90} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: BG_SOFT, padding: "56px 48px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 28 }}>
              Quatre domaines, une seule mission : te rendre opérationnel
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {domains.map((d, i) => (
              <Reveal key={d.id} delay={i * 80}>
                <Link
                  to={`/courses/${d.id}`}
                  className="landing-domain-badge"
                  style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}
                >
                  <div className="landing-course-img-wrap">
                    <MockupThumb variant={d.mockup} height={150} />
                  </div>
                  <div style={{ padding: 20 }}>
                    <div
                      className="landing-domain-icon"
                      style={{
                        width: 40, height: 40, borderRadius: 10, background: "#e8f0fe",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 12, marginTop: -42, border: "3px solid #fff", position: "relative", zIndex: 1,
                      }}
                    >
                      <d.icon size={19} color={BLUE} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 6 }}>{d.title}</div>
                    <div style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>{d.text}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pourquoi" style={{ padding: "88px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 12px", color: INK }}>
            Pourquoi <span className="landing-gradient-text">FhamIA</span> ?
          </h2>
          <p style={{ textAlign: "center", color: SUB, fontSize: 15, margin: "0 0 52px" }}>
            Une approche pensée pour l'apprenant marocain, pas une copie traduite.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {whyItems.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="landing-why-card" style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                <div className="landing-course-img-wrap">
                  <MockupThumb variant={item.mockup} height={130} />
                </div>
                <div style={{ padding: 24 }}>
                  <div
                    className="landing-why-icon"
                    style={{
                      width: 44, height: 44, borderRadius: 10, background: "#e8f0fe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 16, marginTop: -44, border: "3px solid #fff", position: "relative", zIndex: 1,
                    }}
                  >
                    <item.icon size={21} color={BLUE} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: INK }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="parcours" style={{ background: BG_SOFT, padding: "88px 48px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 12px", color: INK }}>
              Les parcours les plus suivis
            </h2>
            <p style={{ textAlign: "center", color: SUB, fontSize: 15, margin: "0 0 52px" }}>
              Choisis un domaine et commence à apprendre dès aujourd'hui.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {courseCards.map((c, i) => (
              <Reveal key={c.id} delay={i * 70}>
                <Link
                  to={`/courses/${c.id}`}
                  className="landing-course-card"
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="landing-course-img-wrap">
                    <MockupThumb variant={c.mockup} icon={c.icon} height={150} />
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
                      {c.level}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: INK }}>{c.title}</h3>
                    <p style={{ fontSize: 13, color: SUB, lineHeight: 1.5, margin: "0 0 12px" }}>{c.description}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: SUB }}>{c.lessons} leçons</div>
                      <ArrowRight size={15} color={BLUE} className="landing-course-arrow" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link
              to="/courses"
              className="landing-cta-outline"
              style={{ fontSize: 14, fontWeight: 700, border: `1.5px solid ${BLUE}`, borderRadius: 8, padding: "12px 28px", display: "inline-block" }}
            >
              Voir tous les parcours
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "88px 40px" }}>
        <Reveal>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 12px", color: INK }}>
            Comment ça marche
          </h2>
          <p style={{ textAlign: "center", color: SUB, fontSize: 15, margin: "0 0 52px" }}>
            Six étapes, de l'inscription au certificat.
          </p>
        </Reveal>
        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, minWidth: 820 }}>
            {steps.map((step, i) => (
              <Reveal key={step.label} delay={i * 90}>
                <div className="landing-step-item" style={{ paddingRight: i < steps.length - 1 ? 20 : 0, paddingLeft: i > 0 ? 4 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                    <div
                      className="landing-step-num"
                      style={{ width: 48, height: 48, borderRadius: 10, border: `1.5px solid ${BLUE}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}
                    >
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="landing-step-connector" style={{ flex: 1, position: "relative", height: 18 }}>
                        <ArrowRight size={20} color={BLUE} className="landing-step-arrowhead" style={{ position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {step.label}
                  </div>
                  <p style={{ fontSize: 13, color: SUB, lineHeight: 1.5, margin: 0 }}>{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ background: BG_SOFT, padding: "88px 48px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 32px", color: INK }}>
              Questions fréquentes
            </h2>
          </Reveal>
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      <section style={{ background: `linear-gradient(120deg, ${BLUE}, #3b7ef0)`, padding: "64px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>
          Prêt à commencer ton parcours ?
        </h2>
        <Link
          to="/register"
          style={{
            display: "inline-block", background: "#fff", color: BLUE, fontWeight: 700, fontSize: 15,
            padding: "14px 32px", borderRadius: 6, transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
            e.currentTarget.style.boxShadow = "0 16px 30px -10px rgba(0,0,0,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Créer un compte gratuit
        </Link>
      </section>

      <footer style={{ padding: "28px 48px", textAlign: "center", fontSize: 12, color: SUB, borderTop: `1px solid ${BORDER}` }}>
        &copy; 2026 FhamIA — Plateforme d'apprentissage IA, Linux, Réseaux et Bases de Données.
      </footer>
    </div>
  );
}
