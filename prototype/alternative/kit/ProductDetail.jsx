function ProductDetail({ productId, onNavigate, onAddToCart, mobile, products }) {
  const { Badge, Tabs, QuantityStepper, Button, ProductCard } = window.ContrastDesignSystem_ef7d27;
  const PRODS = products || window.PRODUCTS;
  const product = PRODS.find((p) => p.id === productId) || PRODS[0];
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState("desc");
  const related = PRODS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, mobile ? 2 : 4);

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: mobile ? "var(--space-5) 20px var(--space-8)" : "var(--space-6) var(--gutter) var(--space-9)" }}>
      <a onClick={() => onNavigate("catalog")} style={{ cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)", color: "var(--text-secondary)" }}>← Назад в каталог</a>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 28 : 56, marginTop: 24 }}>
        <div style={{ aspectRatio: "1", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "var(--text-body-sm)" }}>
          Фото товара
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{product.category} · {product.brand}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: mobile ? "var(--text-display-md)" : "var(--text-display-lg)", color: "var(--text-primary)", margin: "0 0 16px" }}>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-md)", color: "var(--text-primary)" }}>{product.price}</span>
            {product.oldPrice && <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body-md)", color: "var(--text-muted)", textDecoration: "line-through" }}>{product.oldPrice}</span>}
          </div>
          <div style={{ marginBottom: 24 }}>
            <Badge tone={product.stock <= 5 ? "danger" : "success"}>{product.stock <= 5 ? `Осталось ${product.stock} шт` : "В наличии"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
            <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
            <Button variant="primary" size="lg" onClick={() => onAddToCart(product, qty)}>В корзину</Button>
          </div>
          <Tabs tabs={[{ id: "desc", label: "Описание" }, { id: "specs", label: "Характеристики" }, { id: "reviews", label: "Отзывы" }]} active={tab} onChange={setTab} />
          <div style={{ padding: "20px 0", fontFamily: "var(--font-body)", fontSize: "var(--text-body-md)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>
            {tab === "desc" && <p>Товар проходит проверку качества перед поступлением в продажу. Насыщенный вкус, стабильные характеристики.</p>}
            {tab === "specs" && (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Бренд: {product.brand}</li>
                {product.flavor && <li>Вкус: {product.flavor}</li>}
                <li>Остаток: {product.stock} шт</li>
              </ul>
            )}
            {tab === "reviews" && <p>Пока нет отзывов.</p>}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section style={{ marginTop: mobile ? 40 : 64 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-sm)", color: "var(--text-primary)", marginBottom: 20 }}>Похожие товары</h2>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 12 : 20 }}>
            {related.map((p) => <ProductCard key={p.id} category={p.category} name={p.name} price={p.price} oldPrice={p.oldPrice} stock={p.stock} onClick={() => onNavigate("product", p.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
window.ProductDetail = ProductDetail;
