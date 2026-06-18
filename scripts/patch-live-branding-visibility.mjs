import fs from "fs/promises";
import path from "path";

const distDir = path.join(process.cwd(), "dist");
const stylesPath = path.join(distDir, "styles.css");

const marker = "/* FCA_LIVE_BRANDING_VISIBILITY_PATCH_V1 */";

const brandingOverride = `${marker}
:root{
  --fca-blue-900:#081a4a;
  --fca-blue-800:#0f2f84;
  --fca-blue-700:#1a4fff;
  --fca-blue-600:#2f63ff;
  --fca-blue-500:#4c7dff;
  --fca-blue-100:#d7e5ff;
  --fca-blue-050:#eef4ff;
}
body{
  background:radial-gradient(1300px 560px at 82% -130px,#cfe1ff 0%,#e8f0ff 42%,#ffffff 100%);
}
.topbar{
  background:linear-gradient(180deg,#ffffff 0%,#f3f7ff 100%);
  border-bottom:2px solid #b8ccff;
}
.brand-copy strong{
  color:#0f2f84;
}
.brand-copy span{
  color:#274a9c;
  font-weight:700;
}
.nav-link:hover,.nav-link.active{
  background:#e8f0ff;
  color:#1a4fff;
}
.btn-primary{
  background:linear-gradient(135deg,#1a4fff 0%,#0f2f84 100%);
  border-color:#1a4fff;
}
.auricrux-logo svg{
  width:54px;
  height:54px;
}
.auricrux-logo span{
  font-size:14px;
  letter-spacing:.08em;
  color:#8a6116;
  text-shadow:0 1px 0 #fff2c8;
}
.auricrux-dock-btn{
  border-width:2px;
}
`;

async function run() {
  const css = await fs.readFile(stylesPath, "utf8");

  if (css.includes(marker)) {
    const normalized = css.replace(new RegExp(`${marker}[\\s\\S]*$`), brandingOverride.trimEnd() + "\n");
    await fs.writeFile(stylesPath, normalized, "utf8");
    console.log("Live branding visibility patch refreshed.");
    return;
  }

  await fs.writeFile(stylesPath, `${css.trimEnd()}\n\n${brandingOverride}`, "utf8");
  console.log("Live branding visibility patch applied.");
}

await run();
