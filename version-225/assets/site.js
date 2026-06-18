document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".menu-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector(".mobile-nav");
      if (nav) {
        nav.classList.toggle("is-open");
      }
    });
  });

  document.querySelectorAll(".global-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : "";
      var target = form.getAttribute("data-search-url") || form.getAttribute("action") || "./search.html";
      var url = value ? target + "?q=" + encodeURIComponent(value) : target;
      location.href = url;
    });
  });

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var show = function (next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector(".filter-input");
    var selects = Array.from(scope.querySelectorAll(".filter-select"));
    var cards = Array.from(scope.querySelectorAll(".movie-card"));
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter");
        filters[key] = select.value;
      });
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && String(card.dataset[key] || "") !== filters[key]) {
            visible = false;
          }
        });
        card.classList.toggle("is-hidden", !visible);
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  });

  var searchForm = document.getElementById("search-page-form");
  var searchInput = document.getElementById("search-page-input");
  var searchResults = document.getElementById("search-results");
  var typeSelect = document.getElementById("search-type");
  var regionSelect = document.getElementById("search-region");
  var list = window.SiteMovieIndex || [];

  if (searchForm && searchInput && searchResults && list.length) {
    var params = new URLSearchParams(location.search);
    searchInput.value = params.get("q") || "";
    var types = Array.from(new Set(list.map(function (item) { return item.type; }).filter(Boolean))).sort();
    var regions = Array.from(new Set(list.map(function (item) { return item.region; }).filter(Boolean))).sort();
    types.forEach(function (type) {
      var option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
    regions.forEach(function (region) {
      var option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
    var render = function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var selectedType = typeSelect.value;
      var selectedRegion = regionSelect.value;
      var matched = list.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (selectedType && item.type !== selectedType) {
          return false;
        }
        if (selectedRegion && item.region !== selectedRegion) {
          return false;
        }
        return true;
      }).slice(0, 120);
      searchResults.innerHTML = matched.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="duration">' + item.duration + '</span>' +
          '<span class="play-dot">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + item.year + '</p>' +
          '<p class="movie-one-line">' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join("");
    };
    var escapeHtml = function (value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
      });
    };
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
      var next = searchInput.value.trim();
      history.replaceState(null, "", next ? "?q=" + encodeURIComponent(next) : location.pathname);
    });
    searchInput.addEventListener("input", render);
    typeSelect.addEventListener("change", render);
    regionSelect.addEventListener("change", render);
    render();
  }
});
