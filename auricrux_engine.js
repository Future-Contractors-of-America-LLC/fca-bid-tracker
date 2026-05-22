const fs = require("fs");

const MATRIX_FILE = "FCA_COVERAGE_MATRIX.md";

function parseFeatures(text) {
    const blocks = text.split("FEATURE:");
    return blocks.slice(1).map(block => {
        const lines = block.split("\n").map(l => l.trim());
        return {
            name: lines[0],
            status: lines.find(l => l.includes("STATUS")) || ""
        };
    });
}

function generateModule(name) {
    const clean = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const path = `generated/${clean}.js`;

    const content = `module.exports = () => {
    console.log("Module: ${name}");
};
`;

    fs.mkdirSync("generated", { recursive: true });
    fs.writeFileSync(path, content);

    console.log("CREATED:", path);
}

function run() {
    if (!fs.existsSync(MATRIX_FILE)) {
        console.log("Matrix not found.");
        return;
    }

    const matrix = fs.readFileSync(MATRIX_FILE, "utf-8");

    const features = parseFeatures(matrix);

    for (const f of features) {
        if (f.status.includes("PENDING")) {
            console.log("BUILDING:", f.name);
            generateModule(f.name);
        }
    }
}

run();
