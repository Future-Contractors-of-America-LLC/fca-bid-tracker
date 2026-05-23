import fs from "fs";

import { advise as veloryn } from "./agents/officers/veloryn.mjs";
import { advise as numarqon } from "./agents/officers/numarqon.mjs";
import { advise as jurivant } from "./agents/officers/jurivant.mjs";
import { advise as codarion } from "./agents/officers/codarion.mjs";
import { advise as fabroryn } from "./agents/officers/fabroryn.mjs";
import { advise as axioryn } from "./agents/officers/axioryn.mjs";

import { build as uiBuild } from "./agents/specialists/ui-builder.mjs";
import { build as academyBuild } from "./agents/specialists/academy-builder.mjs";
import { build as saasBuild } from "./agents/specialists/saas-builder.mjs";
import { build as commsBuild } from "./agents/specialists/comms-builder.mjs";

const MATRIX = "FCA_COVERAGE_MATRIX.md";

function parsePendingFeatures(text) {
  const blocks = text.split("FEATURE:").slice(1);
  return blocks
    .map(b => b.split("\n")[0].trim())
    .filter(Boolean);
}
