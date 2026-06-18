(function () {
  var form = document.querySelector(".dynamic-search-form");
  var input = document.querySelector(".dynamic-search-input");
  var yearSelect = document.querySelector(".dynamic-year-select");
  var typeSelect = document.querySelector(".dynamic-type-select");
  var results = document.querySelector(".dynamic-search-results");
  var info = document.querySelector(".search-results-info");

  if (!results || !window.MOVIE_DATA) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + tag + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-year=\"" + movie.year + "\" data-type=\"" + movie.type + "\">",
      "  <a class=\"movie-cover\" href=\"./" + movie.file + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\">",
      "    <span class=\"movie-duration\">" + movie.duration + "</span>",
      "    <span class=\"movie-score\">" + movie.score + "</span>",
      "  </a>",
      "  <div class=\"movie-info\">",
      "    <div class=\"movie-meta\"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.type + "</span></div>",
      "    <h3><a href=\"./" + movie.file + "\">" + movie.title + "</a></h3>",
      "    <p>" + movie.summary + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function searchMovies() {
    var keyword = normalize(input ? input.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var type = normalize(typeSelect ? typeSelect.value : "");

    var matched = window.MOVIE_DATA.filter(function (movie) {
      var searchText = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.year,
        movie.tags.join(" "),
        movie.summary
      ].join(" "));

      if (keyword && searchText.indexOf(keyword) === -1) {
        return false;
      }
      if (year && String(movie.year) !== year) {
        return false;
      }
      if (type && normalize(movie.type) !== type) {
        return false;
      }
      return true;
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join("\n");
    if (info) {
      info.textContent = "当前显示 " + matched.length + " 条结果";
    }
  }

  function fillOptions() {
    if (yearSelect) {
      var years = Array.from(new Set(window.MOVIE_DATA.map(function (movie) {
        return movie.year;
      }))).sort(function (a, b) {
        return b - a;
      });
      yearSelect.innerHTML = "<option value=\"\">全部年份</option>" + years.map(function (year) {
        return "<option value=\"" + year + "\">" + year + "</option>";
      }).join("");
    }

    if (typeSelect) {
      var types = Array.from(new Set(window.MOVIE_DATA.map(function (movie) {
        return movie.type;
      }))).sort();
      typeSelect.innerHTML = "<option value=\"\">全部类型</option>" + types.map(function (type) {
        return "<option value=\"" + type + "\">" + type + "</option>";
      }).join("");
    }
  }

  fillOptions();

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  if (input && initialQuery) {
    input.value = initialQuery;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      searchMovies();
    });
  }
  [input, yearSelect, typeSelect].forEach(function (element) {
    if (element) {
      element.addEventListener("input", searchMovies);
      element.addEventListener("change", searchMovies);
    }
  });

  searchMovies();
}());
