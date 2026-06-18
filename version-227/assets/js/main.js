(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = selectAll(".hero-slide", root);
    var dots = selectAll(".hero-dot", root);
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupLocalFilter() {
    selectAll(".local-filter").forEach(function (panel) {
      var input = panel.querySelector(".local-filter-input");
      var list = panel.parentElement.querySelector(".local-filter-list");
      if (!input || !list) {
        return;
      }
      var cards = selectAll(".movie-card", list);
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupPlayer() {
    selectAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var message = shell.querySelector(".player-message");
      var dataTag = shell.querySelector(".play-data");
      var source = "";
      var prepared = false;
      var hls = null;

      if (!video || !button || !dataTag) {
        return;
      }

      try {
        source = JSON.parse(dataTag.textContent || "{}").src || "";
      } catch (error) {
        source = "";
      }

      function prepare() {
        if (prepared || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        shell.classList.add("is-playing");
        if (message) {
          message.textContent = "";
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!prepared || video.paused) {
          play();
        }
      });
      video.addEventListener("error", function () {
        if (message) {
          message.textContent = "播放暂时不可用";
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-search=\"" + escapeHtml(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre) + "\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" title=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(item.year || "精选") + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p class=\"card-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>" +
      "<p class=\"card-line\">" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupGlobalSearch() {
    var form = document.getElementById("globalSearchForm");
    var input = document.getElementById("globalSearchInput");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    var data = window.SEARCH_INDEX || [];

    if (!form || !input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    Array.from(new Set(data.map(function (item) { return item.type; }).filter(Boolean))).sort().forEach(function (type) {
      var option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    Array.from(new Set(data.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse().forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = typeFilter.value;
      var yearValue = yearFilter.value;
      var matched = data.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" "), item.oneLine].join(" ").toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (typeValue && item.type !== typeValue) {
          return false;
        }
        if (yearValue && item.year !== yearValue) {
          return false;
        }
        return true;
      });
      var display = keyword || typeValue || yearValue ? matched.slice(0, 160) : data.slice(0, 80);
      results.innerHTML = display.map(createSearchCard).join("");
      if (status) {
        status.textContent = display.length ? "搜索结果" : "没有找到相关影片";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener("input", render);
    typeFilter.addEventListener("change", render);
    yearFilter.addEventListener("change", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupPlayer();
    setupGlobalSearch();
  });
})();
