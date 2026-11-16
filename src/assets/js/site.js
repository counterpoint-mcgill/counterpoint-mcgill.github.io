// Counterpoint — behaviour and motion. The site works without this file;
// it adds the mobile menu, the contact form's inline reply, click-to-play
// videos, the "copy link" button, and all of the animation.

(function () {
  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (sel, el) {
    return Array.prototype.slice.call((el || document).querySelectorAll(sel));
  };

  /* ───────── Mobile menu ───────── */

  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  var header = document.querySelector(".masthead");
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && menu) {
    $$("li", menu).forEach(function (li, n) {
      li.style.setProperty("--n", n);
    });
    btn.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        setMenu(false);
        btn.focus();
      }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ───────── Contact form ───────── */

  var form = document.querySelector("form[data-ajax]");
  if (form) {
    var status = form.querySelector(".form__status");
    var submit = form.querySelector("[type=submit]");
    var label = submit.innerHTML;
    var say = function (text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", !!isError);
    };
    if (/[?&]sent=1/.test(location.search)) {
      say("Thank you. Your message has been sent.");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return;
      delete data._next;
      submit.disabled = true;
      submit.textContent = "Sending…";
      say("");
      fetch(form.dataset.ajax, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          return r.json().then(function (body) {
            if (!r.ok || String(body.success) !== "true") throw new Error(body.message || "Failed");
          });
        })
        .then(function () {
          form.reset();
          say("Thank you. Your message has been sent.");
        })
        .catch(function () {
          say("Sorry, that did not send. Please try again, or email us directly.", true);
        })
        .finally(function () {
          submit.disabled = false;
          submit.innerHTML = label;
        });
    });
  }

  /* ───────── Videos: load the player only on play ───────── */

  document.addEventListener("click", function (e) {
    var frame = e.target.closest("[data-video]");
    if (!frame) return;
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(frame.dataset.video) + "?autoplay=1&rel=0";
    iframe.title = frame.getAttribute("aria-label") || "Video";
    iframe.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    var holder = document.createElement("div");
    holder.className = "video__frame";
    holder.appendChild(iframe);
    frame.replaceWith(holder);
  });

  /* ───────── Copy link ───────── */

  var copy = document.querySelector("[data-copy-link]");
  if (copy) {
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText(location.href).then(function () {
        copy.textContent = "Link copied";
        setTimeout(function () {
          copy.textContent = "Copy link";
        }, 2000);
      });
    });
  }

  /* ═════════ Motion ═════════ */

  if (calm || !("IntersectionObserver" in window)) {
    root.classList.remove("js", "is-entering");
    return;
  }

  /* Headlines: wrap every word so each can bump up on its own */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var i = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        var outer = document.createElement("span");
        var inner = document.createElement("span");
        outer.className = "w";
        inner.textContent = part;
        inner.style.setProperty("--i", Math.min(i++, 14));
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add("split");
  }

  var HEADLINES = ".page-title, .article__title, .lead__title, .band__title, .soon__big, .prose--page > p:first-child, .prose blockquote p";
  var RISE = [
    ".hero__notes p", ".lead__text > .mono", ".lead__deck", ".band__head > div", ".card",
    ".page-deck", ".filters", ".page-title + .mono", ".article__crumb", ".article__deck",
    ".meta > div", ".prose > *:not(blockquote)", ".prose--page > *", ".field", ".pager", ".empty",
    ".soon .mono", ".row", ".footer__logo", ".contents--footer li", ".footer__base",
    ".marquee--ticker", ".article__cover figcaption",
  ].join(", ");

  $$(HEADLINES).forEach(splitWords);
  $$(RISE).forEach(function (el) {
    if (!el.classList.contains("split")) el.classList.add("rv");
  });
  $$(".section-label").forEach(function (el) {
    el.classList.add("rv-line");
  });
  $$(".lead__link .cover-wrap, .article__cover .cover-wrap").forEach(function (el) {
    el.classList.add("rv-clip");
  });
  $$(".hero__logo").forEach(function (el) {
    el.classList.add("rv-open");
  });

  // Reveal each piece as it scrolls into view. Pieces that arrive together
  // are staggered one after another.
  var seen = new IntersectionObserver(
    function (entries) {
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (!el.classList.contains("split")) el.style.setProperty("--i", Math.min(n++, 8));
        el.classList.add("in");
        seen.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
  );
  $$(".split, .rv, .rv-line").forEach(function (el) {
    seen.observe(el);
  });

  // Wiped-open pictures start fully masked, which the browser counts as
  // off-screen, so watch the box around each one instead.
  var wiped = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$(".rv-clip, .rv-open", entry.target).forEach(function (el) {
          el.classList.add("in");
        });
        wiped.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  $$(".rv-clip, .rv-open").forEach(function (el) {
    wiped.observe(el.parentNode);
  });

  // Safety net: at the very end of the page, show anything still waiting
  function revealRest() {
    $$(".split:not(.in), .rv:not(.in), .rv-line:not(.in), .rv-clip:not(.in)").forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight + 60) el.classList.add("in");
    });
  }

  // Once the first screen has made its entrance, drop the curtain delay
  setTimeout(function () {
    root.classList.remove("is-entering");
  }, 1500);

  /* Scroll: progress bar, hiding masthead, parallax, ticker speed */

  var bar = document.querySelector(".progress");
  var logo = document.querySelector(".hero__logo img");
  var covers = $$(".cover");
  var drifters = $$(".band__title, .page-head .page-title");
  var tracks = $$(".marquee__track").map(function (el) {
    return el.getAnimations()[0];
  }).filter(Boolean);
  var lastY = window.scrollY;
  var speed = 1;
  var ticking = false;
  var coasting = false;

  function coast() {
    // Ease the tickers back to their resting speed after a scroll
    var rest = speed < 0 ? -1 : 1;
    speed += (rest - speed) * 0.06;
    if (Math.abs(speed - rest) < 0.02) speed = rest;
    tracks.forEach(function (a) {
      a.playbackRate = speed;
    });
    if (speed !== rest) requestAnimationFrame(coast);
    else coasting = false;
  }

  function frame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var dy = y - lastY;
    var max = document.documentElement.scrollHeight - vh;

    if (bar) bar.style.setProperty("--progress", max > 0 ? Math.min(1, y / max) : 0);
    if (y >= max - 4) revealRest();

    if (header && menu.hidden) {
      if (dy > 4 && y > 240) header.classList.add("is-hidden");
      else if (dy < -4 || y <= 240) header.classList.remove("is-hidden");
    }

    if (logo && y < vh * 1.2) {
      logo.style.transform = "scale(" + (1 + y / 2600) + ")";
      logo.style.opacity = Math.max(0, 1 - y / (vh * 0.9));
    }

    covers.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 … 0.5 across the screen
      img.style.transform = "translate3d(0," + (p * -9).toFixed(2) + "%,0) scale(1.16)";
    });

    drifters.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = "translate3d(" + (p * 5).toFixed(2) + "%,0,0)";
    });

    if (tracks.length && dy) {
      var dir = dy < 0 ? -1 : 1;
      speed = dir * Math.min(9, Math.max(Math.abs(speed), 1 + Math.abs(dy) / 6));
      if (!coasting) {
        coasting = true;
        requestAnimationFrame(coast);
      }
    }

    lastY = y;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();

  /* Article index: a picture follows the cursor */

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var rows = $$(".row a[data-cover]");
    if (rows.length) {
      var peek = document.createElement("div");
      var peekImg = document.createElement("img");
      peek.className = "peek";
      peek.setAttribute("aria-hidden", "true");
      peekImg.alt = "";
      peek.appendChild(peekImg);
      document.body.appendChild(peek);
      var tx = 0, ty = 0, px = 0, py = 0, following = false;
      var follow = function () {
        px += (tx - px) * 0.14;
        py += (ty - py) * 0.14;
        peek.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) rotate(" + ((tx - px) * 0.04).toFixed(2) + "deg)";
        if (following) requestAnimationFrame(follow);
      };
      rows.forEach(function (a) {
        a.addEventListener("mouseenter", function (e) {
          peekImg.src = a.dataset.cover;
          if (!following) {
            px = e.clientX + 24;
            py = e.clientY - 110;
          }
          peek.classList.add("is-on");
          if (!following) {
            following = true;
            requestAnimationFrame(follow);
          }
        });
        a.addEventListener("mousemove", function (e) {
          tx = Math.min(e.clientX + 24, window.innerWidth - peek.offsetWidth - 16);
          ty = e.clientY - 110;
        });
        a.addEventListener("mouseleave", function () {
          peek.classList.remove("is-on");
          setTimeout(function () {
            if (!peek.classList.contains("is-on")) following = false;
          }, 400);
        });
      });
    }
  }

  /* Scene changes: a curtain rises over the page before moving on */

  var curtainLabel = document.querySelector(".curtain__label");
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /\.(xml|pdf|jpg|png|svg)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page / anchor
    e.preventDefault();
    if (root.classList.contains("is-leaving")) return;
    if (curtainLabel) curtainLabel.textContent = a.dataset.scene || "";
    try {
      sessionStorage.setItem("cp-scene", "1");
    } catch (err) {}
    root.classList.remove("is-entering");
    root.classList.add("is-leaving");
    setTimeout(function () {
      location.href = url.href;
    }, 720);
  });

  // Coming back with the browser's Back button: make sure the curtain is gone
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    root.classList.remove("is-leaving", "is-entering");
    try {
      sessionStorage.removeItem("cp-scene");
    } catch (err) {}
  });
})();
