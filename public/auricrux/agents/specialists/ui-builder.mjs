import fs from "fs";

export function build(target) {
  // minimal deterministic UI generator for known surfaces
  if (target === "Public Landing Page") {
    fs.mkdirSync("src/pages/website", { recursive: true });
    const p = "src/pages/website/Home.jsx";
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, `export default function Home(){return(<div style={{padding:"40px",fontFamily:"Arial"}}><h1>Future Contractors of America</h1><p>Unified Construction Platform: SaaS + Academy + Portal</p><div style={{marginTop:"20px"}}><a href="/portal">Customer Portal</a></div><div style={{marginTop:"10px"}}><a href="/academy">Academy</a></div></div>);}`);
    }
  }
}
