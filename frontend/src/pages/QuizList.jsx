import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { domainMeta } from "../data/domainCourses";
import { api } from "../api";

export default function QuizList() {
  const [quizzesBySlug, setQuizzesBySlug] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      Object.keys(domainMeta).map((slug) =>
        api
          .get(`/quiz/quiz-by-slug/${slug}/`)
          .then((quiz) => [slug, quiz])
          .catch(() => [slug, null])
      )
    ).then((entries) => {
      setQuizzesBySlug(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <main style={{ padding: "32px 40px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-h)", margin: "0 0 8px" }}>
            Quiz
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 26px" }}>
            Teste tes connaissances sur chaque parcours avec des questions QCM.
          </p>

          {loading && <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Chargement…</p>}

          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {Object.entries(domainMeta).map(([id, meta]) => {
                const quiz = quizzesBySlug[id];
                if (!quiz) return null;
                const accentColor = meta.accent === "purple" ? "var(--purple)" : "var(--cyan)";
                return (
                  <div
                    key={id}
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--panel-border)",
                      borderRadius: 14,
                      padding: 22,
                    }}
                  >
                    <ClipboardList size={20} color={accentColor} />
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", margin: "12px 0 6px" }}>
                      {quiz.titre}
                    </h2>
                    <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>
                      {quiz.questions.length} questions &middot; QCM
                    </p>
                    <Link
                      to={`/quiz/${id}`}
                      style={{
                        display: "inline-block",
                        background: accentColor,
                        color: "#04141a",
                        fontWeight: 700,
                        fontSize: 13,
                        padding: "10px 18px",
                        borderRadius: 8,
                      }}
                    >
                      Commencer
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
