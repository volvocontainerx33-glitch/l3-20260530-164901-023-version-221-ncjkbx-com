document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector("[data-menu-button]");
  const menuPanel = document.querySelector("[data-menu-panel]");

  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", () => {
      menuPanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    let active = 0;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle("is-active", thumbIndex === active);
      });
    };

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", () => show(index));
    });

    if (slides.length > 1) {
      setInterval(() => show(active + 1), 6500);
    }
  }

  const quickSearch = document.querySelector("[data-quick-search]");

  if (quickSearch) {
    quickSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = quickSearch.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
      window.location.href = url;
    });
  }

  const params = new URLSearchParams(window.location.search);
  const queryParam = params.get("q") || "";

  document.querySelectorAll("[data-filter-form]").forEach((form) => {
    const grid = form.parentElement.querySelector("[data-filter-grid]");
    const empty = form.parentElement.querySelector("[data-empty-state]");
    const input = form.querySelector("input[name='q']");

    if (input && queryParam) {
      input.value = queryParam;
    }

    const apply = () => {
      if (!grid) {
        return;
      }

      const q = (form.elements.q?.value || "").trim().toLowerCase();
      const region = (form.elements.region?.value || "").trim().toLowerCase();
      const type = (form.elements.type?.value || "").trim().toLowerCase();
      const genre = (form.elements.genre?.value || "").trim().toLowerCase();
      const year = (form.elements.year?.value || "").trim().toLowerCase();
      let visible = 0;

      grid.querySelectorAll(".movie-card").forEach((card) => {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(" ").toLowerCase();

        const ok =
          (!q || text.includes(q)) &&
          (!region || (card.dataset.region || "").toLowerCase().includes(region)) &&
          (!type || (card.dataset.type || "").toLowerCase().includes(type)) &&
          (!genre || (card.dataset.genre || "").toLowerCase().includes(genre) || (card.dataset.tags || "").toLowerCase().includes(genre)) &&
          (!year || (card.dataset.year || "").toLowerCase().includes(year));

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    apply();
  });
});
