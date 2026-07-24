import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Sparkle } from "lucide-react";
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
  border: "1px solid #D1D5DB",
  borderRadius: 12,
  padding: "19px 18px",
  color: INK,
  fontSize: 16,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const label = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: INK,
  marginBottom: 8,
};

function Field(props) {
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
        ...(focused ? { border: `2px solid ${BLUE}`, padding: "18px 17px" } : {}),
        ...props.style,
      }}
    />
  );
}

function AppMockup() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: `linear-gradient(160deg, #dbe7fc 0%, #eef4ff 55%, #f8f9fa 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 44,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
          border: `1px solid #d8e3fb`,
          boxShadow: "0 30px 70px -24px rgba(26, 86, 219, 0.4)",
        }}
      >
        <div style={{ background: "#eef1f5", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6159" }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c941" }} />
          <div style={{ flex: 1, marginLeft: 10, background: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, color: SUB, border: `1px solid ${BORDER}` }}>
            app.fhamia.ma/dashboard
          </div>
        </div>

        <div style={{ display: "flex", height: 300 }}>
          <div style={{ width: 56, background: "#f8fafd", borderRight: `1px solid #eef1f5`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 18 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: BLUE }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: "#d3d9e0" }} />
            ))}
          </div>

          <div style={{ flex: 1, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 12 }}>Bonjour 👋</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ background: BLUE_SOFT, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>4</div>
                <div style={{ fontSize: 8, color: SUB }}>Parcours</div>
              </div>
              <div style={{ background: BLUE_SOFT, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>65%</div>
                <div style={{ fontSize: 8, color: SUB }}>Progression</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Linux", "Bases de Données"].map((t) => (
                <div key={t} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: 26, background: BLUE }} />
                  <div style={{ padding: "6px 8px", fontSize: 9, fontWeight: 600, color: INK }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, access, refresh } = await api.post("/accounts/login/", { email, password });
      saveSession(user, { access, refresh });
      navigate(user.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <div style={{ flex: "0 0 38%", position: "relative", overflow: "hidden" }}>
        <AppMockup />
      </div>

      <div style={{ flex: "1 1 62%", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 56px" }}>
          <div style={{ width: "100%", maxWidth: 620 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkle size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: BLUE, letterSpacing: -0.3 }}>FhamIA</span>
            </div>

            <h1 style={{ fontSize: 42, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 12px", color: INK }}>
              Bon retour !
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: SUB, margin: "0 0 40px" }}>
              Connectez-vous pour poursuivre votre apprentissage.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffdad6", border: "1px solid #ffb4ab", borderRadius: 10, padding: "10px 12px", color: "#93000a", fontSize: 13 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div>
                <label style={label}>Adresse e-mail</label>
                <Field type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ ...label, marginBottom: 0 }}>Mot de passe</label>
                  <a href="#forgot" style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>
                    Mot de passe oublié ?
                  </a>
                </div>
                <div style={{ position: "relative" }}>
                  <Field
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", display: "flex" }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: SUB, cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 17, height: 17, accentColor: BLUE }} />
                Se souvenir de moi
              </label>

              <button
                type="submit"
                disabled={loading}
                className="landing-cta-primary"
                style={{
                  opacity: loading ? 0.7 : 1,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  padding: "23px",
                  borderRadius: 14,
                  border: "none",
                  marginTop: 4,
                }}
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>

              <p style={{ textAlign: "center", fontSize: 14.5, color: SUB, margin: 0 }}>
                Vous n'avez pas encore de compte ?{" "}
                <Link to="/register" style={{ color: BLUE, fontWeight: 700 }}>
                  Créer un compte
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "18px 24px", borderTop: `1px solid ${BORDER}`, fontSize: 12, color: SUB, display: "flex", justifyContent: "center", gap: 24 }}>
          <span>Confidentialité</span>
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
          <Link to="/support" style={{ color: SUB }}>Aide</Link>
        </div>
      </div>
    </div>
  );
}
