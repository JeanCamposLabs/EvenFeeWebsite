/* EvenFee — minimal progressive-enhancement JS.
   The site is fully usable without JavaScript; this only enhances the
   mobile nav, sticky-header shadow, and the footer year. */
(function () {
  "use strict";

  /* Mobile navigation toggle */
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-nav-panel]");

  if (toggle && panel) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close when a link inside the panel is tapped
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // Reset when resizing up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 880) setOpen(false);
    });
  }

  /* Sticky-header shadow once the page is scrolled */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Current year in the footer */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Contact form — AJAX submit with an inline success state.
     Falls back to a normal POST (with redirect to thanks.html) when JS is off. */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      // Not configured yet: let the browser submit normally so it's obvious in setup.
      if (action.indexOf("YOUR_FORM_ID") !== -1) return;

      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var success = form.parentNode.querySelector(".form__success");
      var prev = btn ? btn.innerHTML : "";
      var err = form.querySelector(".form__error");
      if (err) err.remove();
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      var showError = function (msg) {
        var p = document.createElement("p");
        p.className = "form__error";
        p.setAttribute("role", "alert");
        p.textContent = msg;
        form.appendChild(p);
      };

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.hidden = true;
            if (success) { success.hidden = false; success.setAttribute("tabindex", "-1"); success.focus(); }
          } else {
            return res.json().then(function (d) {
              showError(d && d.errors ? d.errors.map(function (x) { return x.message; }).join(", ")
                                      : "Sorry, something went wrong. Please try again.");
            });
          }
        })
        .catch(function () { showError("Network error — please try again in a moment."); })
        .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = prev; } });
    });
  }
})();
