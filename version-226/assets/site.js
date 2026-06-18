(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    const slides = all("[data-hero-slide]");
    const dots = all("[data-hero-dot]");
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === heroIndex);
        });
    }

    function startHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            showHero(i);
            startHero();
        });
    });
    if (prev) {
        prev.addEventListener("click", function () {
            showHero(heroIndex - 1);
            startHero();
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            showHero(heroIndex + 1);
            startHero();
        });
    }
    showHero(0);
    startHero();

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function textOf(card) {
        return normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.type,
            card.dataset.region,
            card.dataset.tags,
            card.textContent
        ].join(" "));
    }

    const panels = all(".filter-panel");
    panels.forEach(function (panel) {
        const input = panel.querySelector(".js-card-search");
        const year = panel.querySelector(".js-card-year");
        const type = panel.querySelector(".js-card-type");
        const clear = panel.querySelector(".js-clear-filter");
        const section = panel.closest("section") || document;
        const cards = all(".js-filter-card", section);
        const empty = section.querySelector(".empty-state");

        function applyFilter() {
            const q = normalize(input && input.value);
            const y = normalize(year && year.value);
            const t = normalize(type && type.value);
            let shown = 0;
            cards.forEach(function (card) {
                const matchText = !q || textOf(card).indexOf(q) !== -1;
                const matchYear = !y || normalize(card.dataset.year) === y;
                const matchType = !t || normalize(card.dataset.type) === t;
                const visible = matchText && matchYear && matchType;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (year) {
            year.addEventListener("change", applyFilter);
        }
        if (type) {
            type.addEventListener("change", applyFilter);
        }
        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                applyFilter();
            });
        }
        applyFilter();
    });

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q") || "";
    const searchInput = document.querySelector(".js-search-page-input");
    const searchSection = document.querySelector("[data-search-page]");
    if (searchInput && keyword) {
        searchInput.value = keyword;
    }
    if (searchSection) {
        const input = searchSection.querySelector(".js-card-search");
        if (input && keyword) {
            input.value = keyword;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
}());
