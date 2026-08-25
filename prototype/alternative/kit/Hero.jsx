function Hero({ onNavigate, mobile }) {
  return (
    <div style={{ position: "relative", height: mobile ? "62vh" : "78vh", minHeight: mobile ? 420 : 520, overflow: "hidden" }}>
      <image-slot id="homepage-hero-bg" shape="rect" placeholder="Drop a hero photo" style={{ position: "absolute", inset: 0, filter: "brightness(0.5)" }}></image-slot>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(16,14,11,0.25) 0%,rgba(16,14,11,0.55) 60%,rgba(16,14,11,0.9) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: mobile ? "var(--space-7)" : "var(--space-9)", textAlign: "center", padding: mobile ? "0 20px" : "0 var(--gutter)" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", color: "var(--accent-gold)", marginBottom: 16 }}>Astana · Premium Hookah Shop</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: mobile ? "var(--text-display-lg)" : "var(--text-display-xl)", color: "var(--text-on-dark)", margin: 0, lineHeight: "var(--leading-tight)" }}>Искусство кальяна</h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-on-dark-muted)", fontSize: "var(--text-body-lg)", maxWidth: 520, margin: "16px auto 32px" }}>
          Табак, кальяны и аксессуары для тех, кто ценит вкус, качество и атмосферу.
        </p>
        <button onClick={() => onNavigate("catalog")} style={{
          fontFamily: "var(--font-body)", letterSpacing: "var(--tracking-wide)", padding: "16px 40px",
          background: "var(--paper-000)", color: "var(--ink-900)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "var(--text-body-md)",
        }}>Смотреть каталог</button>
      </div>
    </div>
  );
}
window.Hero = Hero;
