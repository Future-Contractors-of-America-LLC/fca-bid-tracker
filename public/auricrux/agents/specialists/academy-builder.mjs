import fs from "fs";

export function build() {
  fs.mkdirSync("src/pages/academy", { recursive: true });
  const p = "src/pages/academy/AcademyHome.jsx";
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `export default function AcademyHome(){return(<div style={{padding:"40px",fontFamily:"Arial"}}><h1>FCA Academy</h1><p>Training, certification, and competency verification.</p><div style={{marginTop:"20px"}}><p>Credential verification and feature gating will live here.</p></div><div style={{marginTop:"20px"}}><a href="/">Back</a></div></div>);}`);
  }
}