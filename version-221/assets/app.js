(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-library-scope]").forEach(function (scope) {
      var inputs = scope.querySelectorAll("[data-search-input]");
      var buttons = scope.querySelectorAll("[data-filter-value]");
      var activeFilter = "all";

      function currentQuery() {
        var value = "";
        inputs.forEach(function (input) {
          if (input.value.trim()) {
            value = input.value;
          }
        });
        return text(value);
      }

      function apply() {
        var query = currentQuery();
        var cards = scope.querySelectorAll("[data-movie-card]");
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var group = text(card.getAttribute("data-group"));
          var passesQuery = !query || haystack.indexOf(query) !== -1;
          var passesFilter = activeFilter === "all" || haystack.indexOf(text(activeFilter)) !== -1 || group === text(activeFilter);
          card.classList.toggle("is-hidden", !(passesQuery && passesFilter));
        });
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", apply);
      });

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("is-active", pos === index);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("is-active", pos === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, pos) {
        dot.addEventListener("click", function () {
          show(pos);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var video = document.querySelector("[data-player]");
    if (video) {
      var stream = video.getAttribute("data-src");
      var overlay = document.querySelector("[data-play-overlay]");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      attach();

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
