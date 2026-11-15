(function () {
    'use strict';

    function dispatchChange(input) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function initMobileMenu() {
        var burger = document.getElementById('burger-menu');
        var menu = document.getElementById('header-menu');
        if (!burger || !menu) return;

        burger.addEventListener('click', function () {
            var isActive = menu.classList.toggle('is-active');
            burger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-active');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initConfigurator() {
        var form = document.querySelector('.configurator form');
        if (!form) return;

        var radios = form.querySelectorAll('input[name="request_type"]');
        var blocks = form.querySelectorAll('[data-form-block]');
        var btnCalc = form.querySelector('[data-submit="calc"]');
        var btnService = form.querySelector('[data-submit="service"]');

        function update() {
            var current = form.querySelector('input[name="request_type"]:checked');
            if (!current) return;

            var isService = current.value === 'service';

            blocks.forEach(function (block) {
                var type = block.getAttribute('data-form-block');
                var show =
                    (type === 'equipment' && !isService) ||
                    (type === 'service' && isService);
                block.hidden = !show;
            });

            if (btnCalc) btnCalc.hidden = isService;
            if (btnService) btnService.hidden = !isService;
        }

        radios.forEach(function (radio) {
            radio.addEventListener('change', update);
        });

        document.querySelectorAll('[data-request]').forEach(function (link) {
            link.addEventListener('click', function () {
                var value = link.getAttribute('data-request');
                var target = form.querySelector(
                    'input[name="request_type"][value="' + value + '"]'
                );
                if (target) {
                    target.checked = true;
                    dispatchChange(target);
                }
            });
        });

        update();
    }

    function initAboutSlider() {
        var slider = document.querySelector('.about-slider');
        if (!slider) return;

        var radios = slider.querySelectorAll('input[name="about-slide"]');
        var dots = slider.querySelectorAll('.slider-dot');

        function update() {
            var index = 0;
            radios.forEach(function (radio, i) {
                if (radio.checked) index = i;
            });

            slider.setAttribute('data-slide', String(index + 1));

            dots.forEach(function (dot, i) {
                dot.classList.toggle('slider-dot--active', i === index);
            });
        }

        radios.forEach(function (radio) {
            radio.addEventListener('change', update);
        });

        update();
    }

    function initProcessTabs() {
        var tabs = document.querySelector('.process-tabs');
        if (!tabs) return;

        var radios = tabs.querySelectorAll('input[name="process"]');
        var labels = tabs.querySelectorAll('.process-tabs-nav label');
        var panels = tabs.querySelectorAll('.process-panel');

        function update() {
            var index = 0;
            radios.forEach(function (radio, i) {
                if (radio.checked) index = i;
            });

            labels.forEach(function (label, i) {
                label.classList.toggle('is-active', i === index);
            });

            panels.forEach(function (panel, i) {
                panel.hidden = i !== index;
            });
        }

        radios.forEach(function (radio) {
            radio.addEventListener('change', update);
        });

        update();
    }

    function initScrollTop() {
        var btn = document.querySelector('.scroll-top');
        if (!btn) return;

        var threshold = 400;

        function update() {
            btn.hidden = window.scrollY < threshold;
        }

        window.addEventListener('scroll', update, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        update();
    }

    function initTilt() {
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var noHover = window.matchMedia('(hover: none)').matches;
        if (reduceMotion || noHover) return;

        var cards = document.querySelectorAll('.partner-card, .review-card-b2b');
        if (!cards.length) return;

        var MAX_TILT = 12;
        var SCALE = 1.03;

        cards.forEach(function (card) {
            var rafId = null;
            var mouseX = 0;
            var mouseY = 0;

            function applyTilt() {
                rafId = null;
                var rect = card.getBoundingClientRect();
                var px = mouseX / rect.width - 0.5;
                var py = mouseY / rect.height - 0.5;
                var rotateY = px * MAX_TILT * 2;
                var rotateX = -py * MAX_TILT * 2;

                card.style.transform =
                    'perspective(800px) ' +
                    'rotateX(' + rotateX.toFixed(2) + 'deg) ' +
                    'rotateY(' + rotateY.toFixed(2) + 'deg) ' +
                    'scale(' + SCALE + ')';
            }

            card.addEventListener('mouseenter', function () {
                card.classList.add('is-tilting');
            });

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;

                if (rafId === null) {
                    rafId = requestAnimationFrame(applyTilt);
                }
            });

            card.addEventListener('mouseleave', function () {
                card.classList.remove('is-tilting');
                card.style.transform = '';

                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
        });
    }

    function initStatCounters() {
        var section = document.querySelector('.factory-stats');
        if (!section) return;

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        var items = [];

        section.querySelectorAll('.stat-number').forEach(function (el) {
            var text = el.textContent.trim();
            var match = text.match(/^(\d+)(.*)$/);
            if (!match) return;
            if (/\d/.test(match[2])) return;

            items.push({
                el: el,
                target: parseInt(match[1], 10),
                suffix: match[2]
            });
        });

        if (!items.length) return;

        items.forEach(function (item) {
            item.el.textContent = '0' + item.suffix;
        });

        var triggered = false;
        var DURATION = 1200;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function run() {
            if (triggered) return;
            triggered = true;

            var start = performance.now();

            function frame(now) {
                var progress = Math.min((now - start) / DURATION, 1);
                var eased = easeOutCubic(progress);

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var value = Math.round(item.target * eased);
                    item.el.textContent = value + item.suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(frame);
                }
            }

            requestAnimationFrame(frame);
        }

        if (!('IntersectionObserver' in window)) {
            run();
            return;
        }

        var observer = new IntersectionObserver(function (obsEntries) {
            for (var i = 0; i < obsEntries.length; i++) {
                if (obsEntries[i].isIntersecting) {
                    run();
                    observer.disconnect();
                    break;
                }
            }
        }, { threshold: 0.2 });

        observer.observe(section);
    }

    initMobileMenu();
    initConfigurator();
    initAboutSlider();
    initProcessTabs();
    initScrollTop();
    initTilt();
    initStatCounters();
})();