import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Bot, LayoutGrid, Boxes, Award, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import { api, saveSession } from "../api";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const inputWrap = {
  width: "100%",
  background: "#fff",
  border: `1px solid #D1D5DB`,
  borderRadius: 12,
  padding: "17px 16px",
  color: INK,
  fontSize: 15,
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const label = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: INK,
  marginBottom: 7,
};

function Field({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={{
        ...inputWrap,
        ...(focused ? { border: `2px solid ${BLUE}`, padding: "16px 15px" } : {}),
        ...props.style,
      }}
    />
  );
}

const features = [
  { icon: Bot, label: "Tuteur IA 24/7" },
  { icon: Boxes, label: "Playgrounds interactifs" },
  { icon: Sparkles, label: "Visualisations 3D" },
  { icon: Award, label: "Certificats & Suivi" },
];

function HeroIllustration() {
  return (
    <img
      src="/images/register-hero.png"
      alt="Illustration FhamIA : apprenante entourée d'un écosystème d'intelligence artificielle"
      className="register-hero-float"
      style={{ width: "100%", maxWidth: 460, display: "block" }}
    />
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailTaken = error.toLowerCase().includes("email");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { user, access, refresh } = await api.post("/accounts/register/", {
        prenom: form.firstName,
        nom: form.lastName,
        email: form.email,
        password: form.password,
      });
      saveSession(user, { access, refresh });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 48px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#fff",
        }}
      >
        <Link to="/" style={{ display: "inline-block" }}>
          <Logo size={20} color={BLUE} />
        </Link>
        <div style={{ display: "flex", gap: 32, fontSize: 14, color: SUB, fontWeight: 500 }}>
          <Link to="/courses" className="landing-nav-link">Courses</Link>
          <Link to="/ai-lab" className="landing-nav-link">Playgrounds</Link>
          <Link to="/visualisation" className="landing-nav-link">Visualisations</Link>
          <Link to="/tutor" className="landing-nav-link">Tuteur IA</Link>
          <Link to="/quiz" className="landing-nav-link">Quiz</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/login" className="landing-nav-link" style={{ fontSize: 14, fontWeight: 600, color: BLUE }}>Login</Link>
          <Link
            to="/register"
            className="landing-cta-primary"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "10px 20px", borderRadius: 10, display: "inline-block" }}
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          width: "100%",
          padding: "32px 48px 64px",
          alignItems: "start",
        }}
      >
        <div style={{ justifySelf: "center", width: "100%", maxWidth: 480 }}>
          <h1 style={{ fontSize: 44, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 20px", color: INK }}>
            Votre nouvelle façon d'apprendre grâce à <span style={{ color: BLUE }}>l'IA.</span>
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: SUB, margin: "0 0 32px", maxWidth: 460 }}>
            Accédez à un écosystème complet : <strong style={{ color: BLUE }}>Tuteur IA</strong> personnalisé, cours PDF
            interactifs, <strong style={{ color: BLUE }}>playgrounds</strong> en direct, visualisations 3D immersives, quiz,
            certificats reconnus et un <strong style={{ color: BLUE }}>suivi de progression</strong> intelligent.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36, maxWidth: 420 }}>
            {features.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <f.icon size={16} color={BLUE} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{f.label}</span>
              </div>
            ))}
          </div>

          <HeroIllustration />
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: `1px solid #f3f4f6`,
            padding: "56px 48px",
            boxShadow: "0px 4px 24px rgba(26, 86, 219, 0.07)",
          }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 600, textAlign: "center", margin: "0 0 10px", color: INK }}>
            Créer votre compte
          </h2>
          <p style={{ textAlign: "center", fontSize: 15, color: SUB, margin: "0 0 40px" }}>
            Prêt à transformer votre carrière ?
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>Prénom</label>
                <Field placeholder="Jean" value={form.firstName} onChange={update("firstName")} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Nom</label>
                <Field placeholder="Dupont" value={form.lastName} onChange={update("lastName")} required />
              </div>
            </div>

            <div>
              <label style={label}>Adresse Email</label>
              <Field type="email" placeholder="nom@exemple.com" value={form.email} onChange={update("email")} required />
              {emailTaken && (
                <p style={{ display: "flex", alignItems: "center", gap: 6, color: "#ba1a1a", fontSize: 12, marginTop: 6 }}>
                  <AlertCircle size={13} /> Cet email est déjà utilisé.
                </p>
              )}
            </div>

            <div>
              <label style={label}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <Field
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={label}>Confirmer le mot de passe</label>
              <div style={{ position: "relative" }}>
                <Field
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={update("confirm")}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", display: "flex" }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && !emailTaken && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffdad6", border: "1px solid #ffb4ab", borderRadius: 10, padding: "10px 12px", color: "#93000a", fontSize: 13 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="landing-cta-primary"
              style={{
                opacity: loading ? 0.7 : 1,
                color: "#fff",
                fontWeight: 700,
                fontSize: 17,
                padding: "20px",
                borderRadius: 12,
                border: "none",
                marginTop: 6,
              }}
            >
              {loading ? "Création en cours…" : "Commencer l'apprentissage"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13.5, color: SUB, margin: 0 }}>
              Vous avez déjà un compte ?{" "}
              <Link to="/login" style={{ color: BLUE, fontWeight: 700 }}>
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
