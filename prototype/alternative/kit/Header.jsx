function Header({ onNavigate, cartCount, onOpenCart, transparent, mobile, categories }) {
  const CATS = categories || window.CATEGORIES;
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, background: transparent ? "transparent" : "#fff",
      borderBottom: transparent ? "none" : "1px solid var(--border-subtle)",
    }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "0 20px" : "0 var(--gutter)", display: "flex", alignItems: "center", gap: mobile ? 16 : 32, height: mobile ? 64 : 76 }}>
        <div onClick={() => onNavigate("home")} style={{
          fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "var(--tracking-wider)", textTransform: "uppercase",
          fontSize: mobile ? 17 : 20, cursor: "pointer", color: transparent ? "var(--text-on-dark)" : "var(--text-primary)",
        }}>Contrast</div>
        {!mobile && (
          <nav style={{ display: "flex", gap: 20, flex: "1 1 auto", minWidth: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            {CATS.map((c) => (
              <a key={c.id} onClick={() => onNavigate("catalog", c.label)} style={{
                fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                color: transparent ? "var(--text-on-dark-muted)" : "var(--text-secondary)",
              }}>{c.label}</a>
            ))}
          </nav>
        )}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginLeft: mobile ? "auto" : 0 }}>
          <img src={window.ICON("search")} onClick={() => onNavigate("catalog")} style={{ width: 18, height: 18, cursor: "pointer", filter: transparent ? "invert(1)" : "none", opacity: transparent ? 0.9 : 0.75 }} />
          <div onClick={onOpenCart} style={{ position: "relative", cursor: "pointer" }}>
            <img src={window.ICON("shopping-bag")} style={{ width: 18, height: 18, filter: transparent ? "invert(1)" : "none", opacity: transparent ? 0.9 : 0.75 }} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -8, background: "var(--accent-gold-strong)", color: "#fff",
                borderRadius: "var(--radius-pill)", fontSize: 10, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </div>
        </div>
      </div>
      {mobile && (
        <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 20px 12px", WebkitOverflowScrolling: "touch" }}>
          {CATS.map((c) => (
            <a key={c.id} onClick={() => onNavigate("catalog", c.label)} style={{
              fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              color: transparent ? "var(--text-on-dark-muted)" : "var(--text-secondary)",
            }}>{c.label}</a>
          ))}
        </div>
      )}
    </header>
  );
}
window.Header = Header;
