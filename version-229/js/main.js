(function () {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.mobile-toggle');

    if (header && toggle) {
        toggle.addEventListener('click', function () {
            const isOpen = header.classList.toggle('menu-open');
            document.body.classList.toggle('no-scroll', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        const cards = Array.from(document.querySelectorAll('[data-text]'));
        const queryInput = filterPanel.querySelector('[data-filter-query]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const resetButton = filterPanel.querySelector('[data-filter-reset]');
        const emptyState = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        const applyFilters = function () {
            const keyword = queryInput ? queryInput.value.trim().toLowerCase() : '';
            const region = regionSelect ? regionSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const text = card.dataset.text || '';
                const cardRegion = card.dataset.region || '';
                const cardType = card.dataset.type || '';
                const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                const regionMatch = !region || cardRegion === region;
                const typeMatch = !type || cardType === type;
                const visible = keywordMatch && regionMatch && typeMatch;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        [queryInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (queryInput) {
                    queryInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilters();
            });
        }

        applyFilters();
    }

    window.initMoviePlayer = function (root, sourceUrl) {
        if (!root || !sourceUrl) {
            return;
        }

        const video = root.querySelector('video');
        const poster = root.querySelector('.player-poster');
        const start = root.querySelector('.player-start');
        let loaded = false;
        let hls = null;

        const load = function () {
            if (loaded || !video) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        };

        const play = function () {
            load();
            if (poster) {
                poster.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                const playAttempt = video.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(function () {});
                }
            }
        };

        if (poster) {
            poster.addEventListener('click', play);
        }

        if (start) {
            start.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
