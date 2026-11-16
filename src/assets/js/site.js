// Counterpoint — small behaviours. The site works without this file;
// it only adds the mobile menu, the contact form's inline reply,
// click-to-play videos and the "copy link" button.

(function () {
  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (btn && menu) {
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

  // Contact form: send in the background and reply on the page
  var form = document.querySelector("form[data-ajax]");
  if (form) {
    var status = form.querySelector(".form__status");
    var submit = form.querySelector("[type=submit]");
    var label = submit.innerHTML;
    function say(text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", !!isError);
    }
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

  // Videos: load the player only when someone presses play
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

  // Copy link
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
})();
