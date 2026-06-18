(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-failed");
      });
    });
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var backgrounds = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      backgrounds.forEach(function (item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 4800);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initSearchPage() {
    var box = document.querySelector("[data-search-page]");
    if (!box) {
      return;
    }
    var keyword = box.querySelector("[data-search-keyword]");
    var category = box.querySelector("[data-search-category]");
    var year = box.querySelector("[data-search-year]");
    var region = box.querySelector("[data-search-region]");
    var cards = Array.prototype.slice.call(box.querySelectorAll("[data-movie-card]"));
    var empty = box.querySelector("[data-empty-state]");
    var status = box.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (keyword && initial) {
      keyword.value = initial;
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var c = normalize(category && category.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.year,
          card.dataset.region,
          card.dataset.tags
        ].join(" "));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchCategory = !c || normalize(card.dataset.category) === c;
        var matchYear = !y || normalize(card.dataset.year) === y;
        var matchRegion = !r || normalize(card.dataset.region).indexOf(r) !== -1;
        var matched = matchKeyword && matchCategory && matchYear && matchRegion;
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
      if (status) {
        status.textContent = visible === 0 ? "暂无匹配内容" : "筛选结果已更新";
      }
    }

    [keyword, category, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var button = player.querySelector(".play-button");
      var message = player.querySelector(".player-message");
      var hlsUrl = player.getAttribute("data-hls");
      var mp4Url = player.getAttribute("data-mp4");
      var loaded = false;
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function loadSource() {
        if (!video || loaded) {
          return;
        }
        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported() && hlsUrl) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
          loaded = true;
          player.classList.add("is-ready");
          return;
        }
        if (hlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          loaded = true;
          player.classList.add("is-ready");
          return;
        }
        if (mp4Url) {
          video.src = mp4Url;
          loaded = true;
          player.classList.add("is-ready");
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }
        loadSource();
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            setMessage("请使用播放器控件开始播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }
      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          setMessage("");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
        video.addEventListener("error", function () {
          if (mp4Url && video.src.indexOf(mp4Url) === -1) {
            video.src = mp4Url;
            video.load();
          } else {
            setMessage("当前播放源暂时不可用");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initImages();
    initNavigation();
    initHero();
    initSearchPage();
    initPlayers();
  });
})();
