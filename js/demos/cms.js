// ============================================================
// 13. Sitio web que tú mismo actualizas — panel + sitio en vivo
// ============================================================

function demoCms(host) {
  const CATEGORIES = ["📢 Aviso", "🎉 Promoción", "📰 Noticia"];
  const posts = [
    { title: "Nuevo horario de verano", body: "A partir de junio abrimos desde las 7:00.", cat: "📢 Aviso", ago: "hace 3 días" },
    { title: "Llegó el café de Chiapas", body: "Edición limitada, pruébalo en barra.", cat: "📰 Noticia", ago: "hace 1 semana" },
  ];
  const draft = { title: "", body: "", cat: CATEGORIES[1] };

  host.innerHTML = `
    <div class="cms">
      <section class="cms__panel">
        <p class="cms__tag">🔒 Tu panel de administración</p>
        <label class="site__field"><span>Título</span>
          <input type="text" maxlength="50" placeholder="Ej. 2x1 en frappés este viernes" data-title /></label>
        <label class="site__field"><span>Texto</span>
          <textarea rows="3" maxlength="140" placeholder="Escribe los detalles..." data-body></textarea></label>
        <div class="site__field"><span>Tipo</span>
          <div class="cms__cats">${CATEGORIES.map((c) => `<button type="button" class="site__kind" data-cat="${c}">${c}</button>`).join("")}</div>
        </div>
        <button type="button" class="inv__go" data-publish disabled>Publicar en mi sitio</button>
      </section>
      <section class="cms__site">
        <p class="cms__tag">🌐 Tu sitio web, como lo ven tus clientes</p>
        <div class="cms__page">
          <div class="cms__brand">Café Aurora</div>
          <p class="cms__h">Novedades</p>
          <ul class="cms__posts"></ul>
        </div>
      </section>
    </div>
    <p class="demo-hint">Escribe un aviso y publícalo: aparece en tu sitio al momento, sin llamar al programador.</p>`;

  const list = host.querySelector(".cms__posts");
  const publishBtn = host.querySelector("[data-publish]");
  const titleIn = host.querySelector("[data-title]");
  const bodyIn = host.querySelector("[data-body]");

  // El texto lo escribe el visitante: se pinta con textContent, nunca como HTML
  function postEl(p, fresh) {
    const li = document.createElement("li");
    li.className = fresh ? "is-new" : "";
    li.innerHTML = `<span class="cms__cat"></span><strong></strong><p></p><small></small>`;
    li.querySelector(".cms__cat").textContent = p.cat;
    li.querySelector("strong").textContent = p.title;
    li.querySelector("p").textContent = p.body;
    li.querySelector("small").textContent = p.ago;
    return li;
  }

  function renderPosts(freshFirst) {
    list.replaceChildren(...posts.map((p, i) => postEl(p, freshFirst && i === 0)));
  }

  function syncForm() {
    host.querySelectorAll("[data-cat]").forEach((b) => b.classList.toggle("is-on", b.dataset.cat === draft.cat));
    publishBtn.disabled = draft.title.trim().length < 3;
  }

  host.addEventListener("input", (e) => {
    if (e.target === titleIn) draft.title = titleIn.value;
    if (e.target === bodyIn) draft.body = bodyIn.value;
    syncForm();
  });

  host.addEventListener("click", async (e) => {
    const cat = e.target.closest("[data-cat]");
    if (cat) {
      draft.cat = cat.dataset.cat;
      syncForm();
      return;
    }
    if (!e.target.closest("[data-publish]")) return;
    publishBtn.disabled = true;
    publishBtn.textContent = "Publicando…";
    await wait(700);
    posts.unshift({ title: draft.title.trim(), body: draft.body.trim(), cat: draft.cat, ago: "justo ahora" });
    renderPosts(true);
    titleIn.value = bodyIn.value = "";
    draft.title = draft.body = "";
    publishBtn.textContent = "✓ Publicado. ¿Otro?";
    syncForm();
  });

  renderPosts(false);
  syncForm();
}
