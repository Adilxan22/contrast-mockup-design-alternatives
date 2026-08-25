function Homepage({ onNavigate, mobile, categories, products }) {
  const { ProductCard } = window.ContrastDesignSystem_ef7d27;
  const CATS = categories || window.CATEGORIES;
  const PRODS = products || window.PRODUCTS;
  const trending = PRODS.slice(0, mobile ? 4 : 8);
  return (
    <div>
      <Hero onNavigate={onNavigate} mobile={mobile} />
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "var(--space-6) 20px" : "var(--space-9) var(--gutter)" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          background: "rgba(168,144,108,0.1)", border: "1px solid rgba(168,144,108,0.35)", borderRadius: "var(--radius-md)",
          padding: mobile ? "16px 20px" : "18px 28px",
        }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-md)", color: "var(--text-primary)" }}>
            Скидка 10% на бестабачные смеси по промокоду <strong style={{ color: "var(--accent-gold-strong)" }}>STEAM10</strong>
          </div>
          <a onClick={() => onNavigate("catalog", "Бестабачные смеси")} style={{ cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", color: "var(--accent-gold-strong)", whiteSpace: "nowrap" }}>Смотреть →</a>
        </div>
      </section>
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "0 20px var(--space-7)" : "0 var(--gutter) var(--space-9)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-md)", color: "var(--text-primary)", marginBottom: "var(--space-6)" }}>Категории</h2>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 10 : 16 }}>
          {CATS.map((c) => (
            <div key={c.id} onClick={() => onNavigate("catalog", c.label)} style={{
              aspectRatio: mobile ? "auto" : "1", minHeight: mobile ? 72 : "auto", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", display: "flex",
              alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", padding: 16,
              fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)", transition: "background var(--duration-base) var(--ease-standard)",
            }}>{c.label}</div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "0 20px var(--space-7)" : "0 var(--gutter) var(--space-9)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-md)", color: "var(--text-primary)", margin: 0 }}>Популярное</h2>
          <a onClick={() => onNavigate("catalog")} style={{ cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)" }}>Весь каталог →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 12 : 20 }}>
          {trending.map((p) => <ProductCard key={p.id} category={p.category} name={p.name} price={p.price} oldPrice={p.oldPrice} stock={p.stock} onClick={() => onNavigate("product", p.id)} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}
window.Homepage = Homepage;

function Footer() {
  return (
    <footer style={{ background: "var(--ink-950)", color: "var(--text-on-dark-muted)", padding: "var(--space-8) var(--gutter)", fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-body)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", color: "var(--text-on-dark)", marginBottom: 8 }}>Contrast</div>
          <div>Astana, Kazakhstan</div>
        </div>
        <div>© {new Date().getFullYear()} Contrast — Premium Hookah Shop</div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
