import AuricruxActionHint from "./AuricruxActionHint";
import { filterVisibleActions } from "../ctaBehavior";
import { ctaLightStyle, ctaStyleMap, heroButtonRowStyle } from "../publicShellStyles";

export default function PublicCtaRow({ actions = [], style = heroButtonRowStyle }) {
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const visibleActions = filterVisibleActions(actions, currentPath);

  if (!visibleActions.length) return null;

  return (
    <div style={style}>
      {visibleActions.map((action) => (
        <div key={`${action.href}-${action.label}`} style={{ minWidth: 0 }}>
          <a href={action.href} style={ctaStyleMap[action.variant] || ctaLightStyle}>
            {action.label}
          </a>
          <AuricruxActionHint action={action} />
        </div>
      ))}
    </div>
  );
}
