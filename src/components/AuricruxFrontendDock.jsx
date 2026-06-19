import AuricruxBrandMark from "./AuricruxBrandMark";

const dockButtonStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  border: "1px solid #c9a227",
  background: "linear-gradient(135deg, #fff4d1 0%, #d49a22 100%)",
  color: "#2c1803",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.03em",
  padding: "10px 16px",
  boxShadow: "0 12px 28px rgba(124, 83, 19, 0.28)",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function AuricruxFrontendDock() {
  function openAuricruxWindow() {
    const target = "/auricrux";
    const width = 420;
    const height = 720;
    const left = Math.max(0, window.screen.width - width - 24);
    const top = Math.max(0, window.screen.height - height - 48);
    const features = `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`;
    const opened = window.open(target, "auricrux-assistant", features);
    if (!opened) {
      window.location.href = target;
    }
  }

  return (
    <button
      type="button"
      onClick={openAuricruxWindow}
      style={dockButtonStyle}
      aria-label="Open Auricrux assistant window"
    >
      <AuricruxBrandMark compact showLabel={false} />
      Auricrux
    </button>
  );
}
