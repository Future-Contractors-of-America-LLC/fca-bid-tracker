import { ctaLightStyle, ctaPrimaryStyle, ctaSecondaryStyle, heroButtonRowStyle } from "../publicShellStyles";

const styleMap = {
  primary: ctaPrimaryStyle,
  secondary: ctaSecondaryStyle,
  light: ctaLightStyle,
};

export default function PublicCtaRow({ actions = [], style = heroButtonRowStyle }) {
  return (
    <div style={style}>
      {actions.map((action) => (
        <a key={`${action.href}-${action.label}`} href={action.href} style={styleMap[action.variant] || ctaLightStyle}>
          {action.label}
        </a>
      ))}
    </div>
  );
}
