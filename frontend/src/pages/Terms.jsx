import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Bug, Mail, HelpCircle } from "lucide-react";
import { getSession } from "../api";
import BackButton from "../components/BackButton";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const SECTIONS = [
  { id: "presentation", label: "Présentation" },
  { id: "compte", label: "Compte utilisateur" },
  { id: "utilisation", label: "Utilisation" },
  { id: "certificats", label: "Certificats" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "confidentialite", label: "Confidentialité" },
  { id: "responsabilites", label: "Responsabilités" },
  { id: "contact", label: "Contact" },
];

export default function Terms() {
  const session = getSession();
  const [active, setActive] = useState("presentation");
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/dashboard" />
          <Link to="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: BLUE, textDecoration: "none", cursor: "pointer" }}>FhamIA</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
          </Link>
        </div>
      </nav>

      <main style={{ width: "100%", maxWidth: 1280, margin: "0", padding: "20px 32px 60px" }}>
        <div style={{ fontSize: 12, color: SUB, marginBottom: 16 }}>
          <Link to="/dashboard" style={{ color: BLUE, fontWeight: 600 }}>Accueil</Link> &gt; <span style={{ color: SUB }}>Conditions d'utilisation</span>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 10px", color: INK }}>Conditions d'utilisation</h1>
        <p style={{ fontSize: 15, color: SUB, margin: "0 0 8px" }}>Consultez les règles d'utilisation de la plateforme FhamIA.</p>
        <p style={{ fontSize: 12, color: SUB, fontWeight: 600, margin: "0 0 20px" }}>Dernière mise à jour : 24 Mai 2024</p>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 32, display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: SUB, textTransform: "uppercase", marginBottom: 8 }}>
              Table des matières
            </div>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  borderLeft: active === s.id ? `3px solid ${BLUE}` : "3px solid transparent",
                  padding: "8px 0 8px 12px",
                  fontSize: 12.5,
                  fontWeight: active === s.id ? 700 : 500,
                  color: active === s.id ? BLUE : SUB,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, fontSize: 14.5, color: SUB, lineHeight: 1.7 }}>
            <section id="presentation" ref={(el) => (sectionRefs.current.presentation = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>1. Présentation</h2>
              <p style={{ margin: "0 0 12px" }}>
                Bienvenue sur FhamIA, une plateforme d'apprentissage de nouvelle génération propulsée par l'intelligence artificielle. Notre mission est de démocratiser l'accès au savoir de pointe en combinant une pédagogie rigoureuse et des technologies d'IA adaptatives.
              </p>
              <p style={{ margin: 0 }}>
                En accédant à nos services, vous acceptez d'être lié par les présentes conditions d'utilisation. Ces règles sont conçues pour assurer un environnement d'apprentissage sûr, efficace et stimulant pour l'ensemble de notre communauté mondiale.
              </p>
            </section>

            <section id="compte" ref={(el) => (sectionRefs.current.compte = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>2. Compte utilisateur</h2>
              <p style={{ margin: "0 0 12px" }}>
                La création d'un compte est nécessaire pour accéder à l'intégralité de nos parcours de formation. En créant un compte, vous vous engagez à :
              </p>
              <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
                <li>Fournir des informations exactes, complètes et à jour.</li>
                <li>Maintenir la confidentialité de vos identifiants de connexion.</li>
                <li>Assumer la responsabilité de toutes les activités effectuées sous votre compte.</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée de votre profil.</li>
              </ul>
              <div style={{ background: BLUE_SOFT, borderLeft: `4px solid ${BLUE}`, borderRadius: 8, padding: "16px 18px" }}>
                <p style={{ margin: 0, fontStyle: "italic", color: INK, fontSize: 13.5 }}>
                  L'utilisation de comptes partagés est strictement interdite pour garantir l'intégrité de vos scores de progression personnalisés par l'IA.
                </p>
              </div>
            </section>

            <section id="utilisation" ref={(el) => (sectionRefs.current.utilisation = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>3. Utilisation de la plateforme</h2>
              <p style={{ margin: "0 0 16px" }}>
                FhamIA est un espace dédié à l'excellence éducative. Les comportements suivants sont formellement prohibés :
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#dc2626"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = BORDER; }}
                >
                  <Ban size={20} color="#dc2626" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 4 }}>Harcèlement</div>
                  <p style={{ margin: 0, fontSize: 12.5 }}>Tout propos offensant ou discriminatoire dans nos espaces communautaires.</p>
                </div>
                <div
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#dc2626"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = BORDER; }}
                >
                  <Bug size={20} color="#dc2626" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 4 }}>Exploitation Technique</div>
                  <p style={{ margin: 0, fontSize: 12.5 }}>Tentative de piratage ou de reverse-engineering de nos modèles d'IA.</p>
                </div>
              </div>
            </section>

            <section id="certificats" ref={(el) => (sectionRefs.current.certificats = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>4. Certificats</h2>
              <p style={{ margin: "0 0 12px" }}>
                FhamIA délivre des certificats de réussite pour certains parcours. L'obtention d'un certificat est soumise à :
              </p>
              <ol style={{ margin: "0 0 12px", paddingLeft: 20 }}>
                <li>La complétion de 100% des modules du cours.</li>
                <li>L'obtention d'un score minimum aux évaluations finales validées par l'IA.</li>
                <li>Le respect de la charte d'intégrité académique.</li>
              </ol>
              <p style={{ margin: 0 }}>
                Les certificats peuvent être partagés sur des réseaux professionnels (LinkedIn, etc.) mais ne peuvent être vendus ou falsifiés.
              </p>
            </section>

            <section id="propriete" ref={(el) => (sectionRefs.current.propriete = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>5. Propriété intellectuelle</h2>
              <p style={{ margin: "0 0 12px" }}>
                Tous les contenus présents sur FhamIA (vidéos, textes, algorithmes, logos) sont la propriété exclusive de FhamIA ou de ses partenaires. Toute reproduction sans autorisation est interdite.
              </p>
              <p style={{ margin: 0 }}>
                Concernant vos travaux : vous conservez les droits sur les projets originaux que vous créez sur la plateforme, tout en nous accordant une licence mondiale non-exclusive pour les héberger et les afficher dans le cadre de votre formation.
              </p>
            </section>

            <section id="confidentialite" ref={(el) => (sectionRefs.current.confidentialite = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>6. Confidentialité</h2>
              <p style={{ margin: "0 0 12px" }}>
                La protection de vos données est au cœur de notre architecture technique. Les informations collectées lors de votre navigation servent exclusivement à personnaliser votre expérience d'apprentissage.
              </p>
              <p style={{ margin: 0 }}>
                Pour plus de détails sur la gestion de vos données personnelles et vos droits (RGPD), veuillez consulter notre <strong style={{ color: BLUE }}>Politique de Confidentialité</strong>.
              </p>
            </section>

            <section id="responsabilites" ref={(el) => (sectionRefs.current.responsabilites = el)}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: "0 0 12px" }}>7. Responsabilités</h2>
              <p style={{ margin: "0 0 12px" }}>
                FhamIA s'efforce de fournir des informations précises et une disponibilité continue. Toutefois, nous ne pouvons être tenus responsables :
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Des interruptions temporaires de service pour maintenance.</li>
                <li>Des erreurs mineures de génération de contenu par l'IA.</li>
                <li>Des pertes de données résultant d'une négligence de l'utilisateur.</li>
              </ul>
            </section>

            <section
              id="contact"
              ref={(el) => (sectionRefs.current.contact = el)}
              style={{ background: BLUE, borderRadius: 16, padding: 28 }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>8. Contact</h2>
              <p style={{ margin: "0 0 18px", color: "#dce6fb" }}>
                Pour toute question relative à ces conditions ou pour toute demande d'ordre juridique, notre équipe support est à votre disposition.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="mailto:legal@fhamia.com" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: BLUE, fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 20 }}>
                  <Mail size={15} /> legal@fhamia.com
                </a>
                <Link to="/support" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1.5px solid #fff", color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 20 }}>
                  <HelpCircle size={15} /> Centre d'aide
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: SUB }}>
          <strong style={{ color: INK }}>FhamIA</strong> &middot; &copy; 2026 FhamIA. Tous droits réservés.
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: SUB }}>
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
          <Link to="/support" style={{ color: SUB }}>Support</Link>
        </div>
      </footer>
    </div>
  );
}
