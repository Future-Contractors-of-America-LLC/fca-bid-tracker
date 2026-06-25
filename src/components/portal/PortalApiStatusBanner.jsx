import { PortalAlert } from "./PortalPrimitives";

export default function PortalApiStatusBanner({ status, error, onRetry, label = "workspace data" }) {
  if (status === "loading") {
    return (
      <PortalAlert tone="info">
        Loading {label} from FCA Contractor Command…
      </PortalAlert>
    );
  }

  if (status === "error") {
    return (
      <PortalAlert tone="warning">
        {error || `Unable to load ${label}.`}
        {onRetry ? (
          <>
            {" "}
            <button
              type="button"
              onClick={onRetry}
              style={{
                border: "none",
                background: "transparent",
                color: "#1d4ed8",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </>
        ) : null}
      </PortalAlert>
    );
  }

  return null;
}
