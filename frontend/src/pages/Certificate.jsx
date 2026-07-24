import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, Share2, ShieldCheck, GraduationCap, Calendar, CheckCircle2, KeyRound, QrCode } from "lucide-react";
import { getSession } from "../api";
import { api } from "../api";
import BackButton from "../components/BackButton";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

export default function Certificate() {
  const { certificatId } = useParams();
  const session = getSession();
  const [certificat, setCertificat] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!certificatId) return;
    api
      .get(`/accounts/certificats/${certificatId}/`)
      .then(setCertificat)
      .catch((err) => setError(err.message));
  }, [certificatId]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`certificat-fhamia-${certificat.code_verification}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareLinkedIn = () => {
    const pageUrl = window.location.href;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const initials = session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?";

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/dashboard" />
          <Link to="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: BLUE, textDecoration: "none", cursor: "pointer" }}>FhamIA</Link>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {initials}
        </Link>
      </nav>

      <main style={{ width: "100%", margin: "0", padding: "20px 40px 60px", flex: 1, boxSizing: "border-box" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: SUB, textTransform: "uppercase", marginBottom: 16 }}>
          <Link to="/dashboard" style={{ color: SUB }}>Accueil</Link> &gt; <Link to="/dashboard" style={{ color: SUB }}>Mes certificats</Link> &gt; <span style={{ color: BLUE }}>Certificat</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", color: BLUE }}>Votre certificat</h1>
        <p style={{ fontSize: 14.5, color: SUB, margin: "0 0 28px" }}>Félicitations ! Vous avez terminé avec succès ce parcours.</p>

        {error && <p style={{ color: "#ba1a1a", fontSize: 14 }}>{error}</p>}
        {!error && !certificat && <p style={{ color: SUB, fontSize: 14 }}>Chargement…</p>}

        {certificat && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "stretch" }}>
              {/* Carte du certificat */}
              <div
                ref={cardRef}
                style={{
                  position: "relative",
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: 64,
                  boxShadow: "0 4px 24px rgba(16,24,40,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 32,
                  overflow: "hidden",
                  minHeight: 560,
                }}
              >
                {/* Décor de fond */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: -120, left: -120, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${BLUE_SOFT} 0%, transparent 70%)` }} />
                  <div style={{ position: "absolute", bottom: -140, right: -140, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${BLUE_SOFT} 0%, transparent 70%)` }} />
                  <div style={{ position: "absolute", inset: 14, border: `1.5px solid ${BLUE_SOFT}`, borderRadius: 14 }} />
                  <svg style={{ position: "absolute", top: 24, left: 24 }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                    <path d="M2 22 V6 a4 4 0 0 1 4-4 h16" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                  <svg style={{ position: "absolute", top: 24, right: 24, transform: "rotate(90deg)" }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                    <path d="M2 22 V6 a4 4 0 0 1 4-4 h16" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                  <svg style={{ position: "absolute", bottom: 24, left: 24, transform: "rotate(-90deg)" }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                    <path d="M2 22 V6 a4 4 0 0 1 4-4 h16" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                  <svg style={{ position: "absolute", bottom: 24, right: 24, transform: "rotate(180deg)" }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                    <path d="M2 22 V6 a4 4 0 0 1 4-4 h16" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </div>

                <div style={{ position: "relative", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: BLUE }}>FhamIA</div>
                </div>

                <div style={{ position: "relative", textAlign: "center" }}>
                  <div style={{ fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: SUB, fontWeight: 700, marginBottom: 4 }}>
                    Certificat de réussite
                  </div>
                  <div style={{ width: 70, height: 3, background: `linear-gradient(90deg, ${BLUE}, #3b7ef0)`, margin: "12px auto 0", borderRadius: 2 }} />
                </div>

                <div style={{ position: "relative", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: SUB, fontStyle: "italic", margin: "0 0 12px" }}>Ce certificat est décerné à</p>
                  <h2 style={{ fontSize: 38, fontWeight: 800, color: INK, margin: "0 0 26px" }}>{certificat.utilisateur_nom}</h2>
                  <p style={{ fontSize: 14, color: SUB, margin: "0 0 10px" }}>pour avoir terminé avec succès le parcours :</p>
                  <div style={{ fontSize: 21, fontWeight: 700, color: BLUE }}>{certificat.parcours_titre}</div>
                </div>

                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${BORDER}`, paddingTop: 26, marginTop: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>Date de délivrance</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>
                      {new Date(certificat.date_obtention).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ position: "relative", width: 62, height: 62, borderRadius: "50%", background: `linear-gradient(135deg, ${BLUE}, #3b7ef0)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: `0 8px 20px -6px rgba(26,86,219,0.55)` }}>
                    <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: `2px dashed ${BLUE_SOFT}` }} />
                    <ShieldCheck size={26} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>ID du certificat</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{certificat.code_verification}</div>
                  </div>
                </div>
              </div>

              {/* Colonne détails */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: "0 0 18px" }}>Détails de la formation</h3>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <GraduationCap size={16} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Parcours</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{certificat.parcours_titre}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Calendar size={16} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Délivré le</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>
                        {new Date(certificat.date_obtention).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle2 size={16} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Statut</div>
                      <span style={{ display: "inline-block", marginTop: 3, fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 20 }}>
                        Certificat validé
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <KeyRound size={16} color={BLUE} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Code de vérification</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{certificat.code_verification}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minHeight: 20 }} />

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginBottom: 8 }}>
                      <span>Progrès</span>
                      <span style={{ color: BLUE }}>100%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 8, background: BLUE_SOFT, overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", background: BLUE, borderRadius: 8 }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="landing-cta-primary"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", opacity: downloading ? 0.6 : 1 }}
                >
                  <Download size={17} /> {downloading ? "Génération…" : "Télécharger en PDF"}
                </button>

                <button
                  onClick={handleShareLinkedIn}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", color: BLUE, fontWeight: 700, fontSize: 14, padding: "14px", borderRadius: 12, border: `1.5px solid ${BLUE}`, cursor: "pointer" }}
                >
                  <Share2 size={17} /> Partager
                </button>

                <div style={{ background: BLUE, borderRadius: 16, padding: 22 }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Ajoutez ce certificat à LinkedIn</h4>
                  <p style={{ fontSize: 12.5, color: "#dce6fb", margin: "0 0 14px", lineHeight: 1.5 }}>
                    Valorisez vos compétences auprès des recruteurs en un seul clic.
                  </p>
                  <button
                    onClick={handleShareLinkedIn}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0 }}
                  >
                    Ajouter maintenant →
                  </button>
                </div>
              </div>
            </div>

            {/* Authenticité */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginTop: 24, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 90, height: 90, borderRadius: 10, background: PAGE_BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <QrCode size={44} color={SUB} />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: "0 0 6px" }}>Authenticité du certificat</h4>
                <p style={{ fontSize: 13, color: SUB, margin: "0 0 8px", lineHeight: 1.6, maxWidth: 620 }}>
                  Ce certificat est authentifié par le réseau FhamIA. Pour vérifier l'authenticité de ce document, scannez le code QR ci-contre ou saisissez l'identifiant unique sur notre portail de vérification.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: BLUE }}>
                  <ShieldCheck size={14} /> ID Unique : {certificat.code_verification}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: SUB }}>
          <strong style={{ color: INK }}>FhamIA</strong> &middot; &copy; 2026 FhamIA. Tous droits réservés.
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: SUB }}>
          <Link to="/support" style={{ color: SUB }}>Support</Link>
          <Link to="/terms" style={{ color: SUB }}>Conditions</Link>
        </div>
      </footer>
    </div>
  );
}
