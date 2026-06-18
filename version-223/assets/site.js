(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var button = qs("[data-menu-button]");
        var panel = qs("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        qsa("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input || !input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupHero() {
        var root = qs("[data-hero]");
        if (!root) {
            return;
        }
        var slides = qsa("[data-hero-slide]", root);
        var dots = qsa("[data-hero-dot]", root);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupFilters() {
        qsa("[data-filter-scope]").forEach(function (scope) {
            var input = qs("[data-filter-input]", scope);
            var cards = qsa("[data-movie-card]", scope);
            var buttons = qsa("[data-filter-button]", scope);
            var active = "";
            function apply() {
                var text = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var okText = !text || haystack.indexOf(text) !== -1;
                    var okActive = !active || haystack.indexOf(active) !== -1;
                    card.hidden = !(okText && okActive);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    active = normalize(button.getAttribute("data-filter-button"));
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
            var queryInput = qs("[data-query-input]", scope);
            if (queryInput) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    queryInput.value = q;
                    apply();
                }
            }
        });
    }

    window.initPlayer = function (videoSource) {
        var video = qs("#movie-player");
        var cover = qs("[data-play-cover]");
        var playButton = qs("[data-play-button]");
        var message = qs("#player-message");
        var hls = null;
        if (!video || !videoSource) {
            return;
        }
        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }
        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoSource;
                video.setAttribute("data-ready", "1");
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoSource);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("播放暂时不可用");
                    }
                });
                video.setAttribute("data-ready", "1");
                return;
            }
            video.src = videoSource;
            video.setAttribute("data-ready", "1");
        }
        function start() {
            attach();
            var promise = video.play();
            if (promise && typeof promise.then === "function") {
                promise.then(function () {
                    if (cover) {
                        cover.classList.add("is-hidden");
                    }
                    setMessage("");
                }).catch(function () {
                    setMessage("点击播放按钮开始观看");
                });
            } else if (cover) {
                cover.classList.add("is-hidden");
            }
        }
        if (playButton) {
            playButton.addEventListener("click", start);
        }
        if (cover && cover !== playButton) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && cover) {
                cover.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
