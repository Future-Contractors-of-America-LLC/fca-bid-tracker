"""Generate Auricrux head-and-shoulders portrait assets from the character turnaround sheet."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TURNAROUND = ROOT / "public" / "brand" / "auricrux" / "auricrux-character-turnaround.png"
OUT_DIRS = [
    ROOT / "public" / "brand" / "auricrux",
    ROOT / "brand-assets" / "auricrux",
]


def headshot_from_panel(src: Image.Image, panel_box: tuple[int, int, int, int]) -> Image.Image:
    panel = src.crop(panel_box)
    pw, ph = panel.size
    content = panel.crop((0, 0, pw, int(ph * 0.83)))
    cw, ch = content.size
    portrait = content.crop((int(cw * 0.12), 0, int(cw * 0.88), int(ch * 0.36)))
    pw2, ph2 = portrait.size
    side = min(pw2, ph2)
    left = (pw2 - side) // 2
    square = portrait.crop((left, 0, left + side, side))
    return square.resize((512, 512), Image.LANCZOS)


def main() -> None:
    src = Image.open(TURNAROUND).convert("RGBA")
    w, h = src.size
    panels = {
        "auricrux-avatar-portrait.png": (0, 0, w // 2, h // 2),
        "auricrux-avatar-portrait-left.png": (0, h // 2, w // 2, h),
        "auricrux-avatar-portrait-right.png": (w // 2, h // 2, w, h),
    }
    for out_dir in OUT_DIRS:
        out_dir.mkdir(parents=True, exist_ok=True)
    for filename, box in panels.items():
        img = headshot_from_panel(src, box)
        for out_dir in OUT_DIRS:
            img.save(out_dir / filename, optimize=True)
        print(f"wrote {filename}")


if __name__ == "__main__":
    main()
