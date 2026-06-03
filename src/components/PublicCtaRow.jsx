import { ctaLightStyle, ctaStyleMap, heroButtonRowStyle } from "../publicShellStyles";

export default function PublicCtaRow({ actions = [], style = heroButtonRowStyle }) {
  return (
    <div style={style}>
      {actions.map((action) => (
        <a key={`${action.href}-${action.label}`} href={action.href} style={ctaStyleMap[action.variant] || ctaLightStyle}>
          {action.label}
        </a>
      ))}
    </div>
  );
}
