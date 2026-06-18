(function () {
  var navToggle = document.querySelector(".site-nav-toggle");
  var nav = document.querySelector(".site-nav");
  var search = document.querySelector(".site-search");

  if (navToggle && nav && search) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters(scope) {
    var panel = scope.querySelector(".filter-panel");
    var target = scope.querySelector(".filter-target");
    if (!panel || !target) {
      return;
    }

    var keywordInput = panel.querySelector(".movie-filter-input");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".movie-filter-select"));
    var empty = panel.querySelector(".filter-empty");
    var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = keyword === "" || text.indexOf(keyword) !== -1;

        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter-field");
          var selected = normalize(select.value);
          if (selected && normalize(card.getAttribute("data-" + field)) !== selected) {
            matched = false;
          }
        });

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  }

  setupFilters(document);
}());
