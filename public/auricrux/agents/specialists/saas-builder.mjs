export function build() {
  fs.mkdirSync("src/pages/portal", { recursive: true });
  const p = "src/pages/portal/PortalHome.jsx";
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `export default function PortalHome(){return(<div style={{padding:"40px",fontFamily:"Arial"}}><h1>Customer Portal</h1><h2>FCA Customer Workspace</h2><p>Pilot workspace entry point.</p><div style={{marginTop:"20px"}}><a href="/">Back</a></div></div>);}`);
  }
}
