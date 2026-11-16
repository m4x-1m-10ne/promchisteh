(function () {
    'use strict';

    function dispatchChange(input) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function getFieldError(input) {
        var value = input.value || '';
        var name = input.name;

        if (input.type === 'checkbox') {
            return input.checked ? '' : 'Необходимо согласие на обработку данных';
        }

        if (name === 'lastName') {
            return value.trim() ? '' : 'Укажите фамилию';
        }

        if (name === 'firstName') {
            return value.trim() ? '' : 'Укажите имя';
        }

        if (name === 'phone') {
            var digits = value.replace(/\D/g, '');
            if (!digits) return 'Укажите телефон';
            return digits.length === 11 ? '' : 'Введите номер полностью: +7 (XXX) XXX-XX-XX';
        }

        if (name === 'email') {
            if (!value.trim()) return 'Укажите email';
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Введите корректный email';
        }

        return '';
    }

    function applyFieldError(group, message) {
        var errorEl = group.querySelector('.form-error');
        if (message) {
            group.classList.add('is-invalid');
            if (errorEl) errorEl.textContent = message;
        } else {
            group.classList.remove('is-invalid');
            if (errorEl) errorEl.textContent = '';
        }
    }

    function openModal(modal) {
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
            modal.classList.add('is-open');
        });

        var closeBtn = modal.querySelector('.modal__close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal(modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        setTimeout(function () {
            modal.hidden = true;
        }, 250);
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

    function initPhoneMask() {
        var input = document.getElementById('phone');
        if (!input) return;

        function formatPhone(rawValue) {
            var digits = rawValue.replace(/\D/g, '');

            if (!digits) return '';

            if (digits[0] === '8') {
                digits = '7' + digits.slice(1);
            } else if (digits[0] !== '7') {
                digits = '7' + digits;
            }

            digits = digits.slice(0, 11);

            var result = '+7';

            if (digits.length > 1) {
                result += ' (' + digits.slice(1, 4);
            }
            if (digits.length >= 5) {
                result += ') ' + digits.slice(4, 7);
            }
            if (digits.length >= 8) {
                result += '-' + digits.slice(7, 9);
            }
            if (digits.length >= 10) {
                result += '-' + digits.slice(9, 11);
            }

            return result;
        }

        input.addEventListener('keydown', function (e) {
            if (e.key.length > 1) return;

            var allowed = /[0-9+\s()\-]/;
            if (!allowed.test(e.key)) {
                e.preventDefault();
            }
        });

        input.addEventListener('input', function () {
            var formatted = formatPhone(input.value);
            input.value = formatted;
            input.setSelectionRange(formatted.length, formatted.length);
        });

        input.addEventListener('paste', function (e) {
            e.preventDefault();
            var pasted = (e.clipboardData || window.clipboardData).getData('text');
            var formatted = formatPhone(pasted);
            input.value = formatted;
            input.setSelectionRange(formatted.length, formatted.length);
        });

        if (input.value) {
            input.value = formatPhone(input.value);
        }
    }

    function initFormValidation() {
        var form = document.querySelector('.configurator form');
        if (!form) return;

        var groups = form.querySelectorAll('.form-group');

        groups.forEach(function (group) {
            var input = group.querySelector('input, textarea');
            if (!input || !input.required) return;

            function check() {
                var error = getFieldError(input);
                applyFieldError(group, error);
            }

            input.addEventListener('blur', check);

            input.addEventListener('input', function () {
                if (group.classList.contains('is-invalid')) {
                    check();
                }
            });

            if (input.type === 'checkbox') {
                input.addEventListener('change', check);
            }
        });

        form._validateAll = function () {
            var allValid = true;

            groups.forEach(function (group) {
                var input = group.querySelector('input, textarea');
                if (!input || !input.required) return;

                var error = getFieldError(input);
                applyFieldError(group, error);
                if (error) allValid = false;
            });

            return allValid;
        };

        form._clearErrors = function () {
            groups.forEach(function (group) {
                applyFieldError(group, '');
            });
        };
    }

    function initModal() {
        var modal = document.getElementById('success-modal');
        if (!modal) return modal;

        modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
            el.addEventListener('click', function () {
                closeModal(modal);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hidden) {
                closeModal(modal);
            }
        });

        return modal;
    }

    function initContactForm() {
        var configurator = document.querySelector('.configurator');
        if (!configurator) return;

        var form = configurator.querySelector('form');
        var modal = document.getElementById('success-modal');
        if (!form || !modal) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var isValid = typeof form._validateAll === 'function'
                ? form._validateAll()
                : true;

            if (!isValid) {
                var firstInvalid = form.querySelector('.form-group.is-invalid input, .form-group.is-invalid textarea');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            var activeBtn = form.querySelector('.btn-submit:not([hidden])');
            var originalText = activeBtn ? activeBtn.textContent : '';

            if (activeBtn) {
                activeBtn.disabled = true;
                activeBtn.textContent = 'Отправка…';
            }

            setTimeout(function () {
                if (activeBtn) {
                    activeBtn.disabled = false;
                    activeBtn.textContent = originalText;
                }

                form.reset();

                if (typeof form._clearErrors === 'function') {
                    form._clearErrors();
                }

                var current = form.querySelector('input[name="request_type"]:checked');
                if (current) {
                    current.dispatchEvent(new Event('change', { bubbles: true }));
                }

                openModal(modal);
            }, 800);
        });
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
    initPhoneMask();
    initFormValidation();
    initModal();
    initContactForm();
    initAboutSlider();
    initProcessTabs();
    initScrollTop();
    initTilt();
    initStatCounters();
})();