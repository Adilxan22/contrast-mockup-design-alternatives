function Catalog({ initialCategory, onNavigate, mobile, categories, products }) {
  const { ProductCard, Input, Checkbox, Select, Tag } = window.ContrastDesignSystem_ef7d27;
  const CATS = categories || window.CATEGORIES;
  const PRODS = products || window.PRODUCTS;
  const [category, setCategory] = React.useState(initialCategory || null);
  React.useEffect(() => { setCategory(initialCategory || null); }, [initialCategory]);
  const [brands, setBrands] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const allBrands = [...new Set(PRODS.map((p) => p.brand))];

  const toggleBrand = (b) => setBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const filtered = PRODS.filter((p) =>
    (!category || p.category === category) &&
    (brands.length === 0 || brands.includes(p.brand)) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "var(--space-5) 20px var(--space-8)" : "var(--space-6) var(--gutter) var(--space-9)" }}>
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: mobile ? "var(--text-display-md)" : "var(--text-display-lg)", color: "var(--text-primary)", margin: "0 0 16px" }}>Каталог</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", overflowX: mobile ? "auto" : "visible" }}>
          <Tag selected={!category} onClick={() => setCategory(null)}>Все</Tag>
          {CATS.map((c) => <Tag key={c.id} selected={category === c.label} onClick={() => setCategory(c.label)}>{c.label}</Tag>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "240px 1fr", gap: mobile ? 24 : 40 }}>
        <aside style={{ display: "flex", flexDirection: mobile ? "row" : "column", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: mobile ? "1 1 100%" : "none" }}>
            <Input placeholder="Поиск по каталогу" value={query} onChange={(e) => setQuery(e.target.value)} icon={`<img src="${window.ICON("search")}" style="width:16px;height:16px"/>`} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-wide)", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 12 }}>Бренд</div>
            <div style={{ display: "flex", flexDirection: mobile ? "row" : "column", flexWrap: "wrap", gap: 12 }}>
              {allBrands.map((b) => (
                <Checkbox key={b} label={b} checked={brands.includes(b)} onChange={() => toggleBrand(b)} count={PRODS.filter((p) => p.brand === b).length} />
              ))}
            </div>
          </div>
        </aside>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", color: "var(--text-secondary)" }}>{filtered.length} товаров</span>
            <div style={{ width: mobile ? "100%" : 220 }}><Select options={[{ value: "popular", label: "По популярности" }, { value: "price_asc", label: "Цена: сначала дешёвые" }, { value: "price_desc", label: "Цена: сначала дорогие" }]} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: mobile ? 12 : 20 }}>
            {filtered.map((p) => <ProductCard key={p.id} category={p.category} name={p.name} price={p.price} oldPrice={p.oldPrice} stock={p.stock} onClick={() => onNavigate("product", p.id)} />)}
          </div>
          {filtered.length === 0 && <div style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", padding: "var(--space-8) 0", textAlign: "center" }}>Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
window.Catalog = Catalog;
