import LegalPageShell from "../../components/LegalPageShell";

export default function IpNotice() {
  return (
    <LegalPageShell title="Intellectual Property" eyebrow="Legal" currentHref="/ip">
      <p><strong>Effective date:</strong> June 19, 2026</p>
      <p>
        Future Contractors of America LLC (&quot;FCA&quot;) owns the intellectual property described on this page.
        Unauthorized use of FCA or Auricrux marks, artwork, software, or training content is prohibited.
      </p>

      <h3 style={{ color: "#0f172a" }}>Trademarks</h3>
      <p>
        FCA (TM), Future Contractors of America (TM), Auricrux (TM), FCA Contractor Command (TM), the FCA hex shield design,
        and the Auricrux crux medallion design are trademarks or pending trademarks of Future Contractors of America LLC.
      </p>
      <p>
        The Auricrux Crux Pulse animation is a distinctive motion identifier for the Auricrux intelligence layer.
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li><a href="/brand/fca/fca-hex-mark.svg">FCA Hex Mark (SVG specimen)</a></li>
        <li><a href="/brand/auricrux/auricrux-crux-mark.svg">Auricrux Crux Mark (SVG specimen)</a></li>
        <li><a href="/brand/auricrux/auricrux-humanoid-mark.svg">Auricrux Humanoid Mark (SVG specimen)</a></li>
        <li><a href="/brand/animations/auricrux-crux-pulse.svg">Auricrux Crux Pulse animation (SVG)</a></li>
      </ul>

      <h3 style={{ color: "#0f172a" }}>Copyright</h3>
      <p>
        Copyright (c) 2026 Future Contractors of America LLC. All rights reserved.
      </p>
      <p>
        This includes website design, software source code, brand artwork, Academy curriculum materials, and
        mobile application assets. No reproduction or derivative use without written permission.
      </p>

      <h3 style={{ color: "#0f172a" }}>Patents</h3>
      <p>
        Patent applications may be pending for systems and methods embodied in the FCA platform.
        Contact us before implementing similar technology in competing products.
      </p>

      <h3 style={{ color: "#0f172a" }}>Permitted use</h3>
      <p>
        Customers may display FCA branding only as provided within the licensed product interface.
        Press, partners, and integrators must request written brand guidelines before using logos.
      </p>

      <h3 style={{ color: "#0f172a" }}>Reporting infringement</h3>
      <p>
        Email <a href="mailto:dmca@futurecontractorsofamerica.com">dmca@futurecontractorsofamerica.com</a> for DMCA notices
        per our <a href="/dmca">DMCA Copyright Policy</a>. General IP inquiries:{" "}
        <a href="mailto:info@futurecontractorsofamerica.com">info@futurecontractorsofamerica.com</a>.
      </p>
    </LegalPageShell>
  );
}
