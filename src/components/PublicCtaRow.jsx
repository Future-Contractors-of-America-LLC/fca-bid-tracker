import AuricruxActionHint from "./AuricruxActionHint";
import { ctaLightStyle, ctaStyleMap, heroButtonRowStyle } from "../publicShellStyles";

export default function PublicCtaRow({ actions = [], style = heroButtonRowStyle }) {
  return (
    <div style={style}>
      {actions.map((action) => (
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
