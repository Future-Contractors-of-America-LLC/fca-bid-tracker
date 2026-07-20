import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import ProductIllustration from "../../components/ProductIllustration";
import { pageShellStyle, cardStyle, ctaPrimaryStyle, ctaSecondaryStyle, responsiveGrid } from "../../publicShellStyles";

/**
 * Academy student entry — same shell language as /login and the rest of FCA,
 * not a separate dark marketing experience.
 */
export default function AcademyStudentPortal() {
  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh", paddingTop: 0, maxWidth: "none", margin: 0, width: "100%" }}>
      <PublicTopNav />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px) 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ ...cardStyle, borderTop: "3px solid #0c2340" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <FcaBrandMark compact showTagline={false} />
              <div>
                <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  FCA Academy
                </div>
                <h1 style={{ margin: "4px 0 0", fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "#0c2340" }}>
                  Student sign-in
                </h1>
              </div>
            </div>
            <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
              Use the same FCA workspace login your team already knows. After sign-in you land in Academy —
              classes, progress, and credentials — not a separate student skin.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              <a href="/login?next=/portal/academy" style={ctaPrimaryStyle}>Student login</a>
              <a href="/academy/catalog" style={ctaSecondaryStyle}>Browse course catalog</a>
            </div>
            <div style={{ marginTop: 22, padding: 14, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>What you get after login</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.75 }}>
                <li>Assigned pathways and classroom progress</li>
                <li>Syllabus, labs, and credential checkpoints</li>
                <li>Same session as Contractor Command when your org uses both</li>
              </ul>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 0, marginTop: 16 }}>
              School CTE learners: start at the{" "}
              <a href="/cte/portal" style={{ color: "#0c2340", fontWeight: 700 }}>CTE portal</a>
              {" "}instead of the commercial Academy store.
            </p>
          </section>

          <aside>
            <ProductIllustration variant="academy" />
            <div style={{ ...cardStyle, marginTop: 16 }}>
              <div style={{ fontWeight: 800, color: "#0c2340", marginBottom: 8 }}>Need an account?</div>
              <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
                New learners get access from their contractor org, instructor, or Academy purchase.
                If you already bought a course, sign in with that email.
              </p>
              <a href="/academy/store" style={{ ...ctaSecondaryStyle, display: "inline-flex" }}>Academy store</a>
            </div>
          </aside>
        </div>

        <section style={{ ...responsiveGrid(220), marginTop: 28 }}>
          {[
            { title: "One login", detail: "Same /login surface as the rest of FCA — navy, gold, and workspace continuity." },
            { title: "Learner dashboard", detail: "Progress and credentials land in /portal/academy after authentication." },
            { title: "Catalog first", detail: "Syllabi stay public; enrollment and tracking require sign-in." },
          ].map((item) => (
            <article key={item.title} style={{ ...cardStyle, marginBottom: 0 }}>
              <h3 style={{ marginTop: 0, color: "#0c2340", fontSize: "1.05rem" }}>{item.title}</h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: 0 }}>{item.detail}</p>
            </article>
          ))}
        </section>
      </main>

      <ShellFooter />
    </div>
  );
}
