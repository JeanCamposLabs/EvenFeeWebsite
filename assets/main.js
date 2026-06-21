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

  /* Header: on the hero page (with JS), stay hidden over the hero and slide in
     once the next section scrolls into view. On other pages, just gain a shadow. */
  var header = document.querySelector("[data-header]");
  if (header) {
    var heroSection = document.querySelector(".hero");
    if (heroSection && document.documentElement.classList.contains("hero-reveal")) {
      var onHeroScroll = function () {
        header.classList.toggle("is-revealed", window.scrollY > heroSection.offsetHeight - 80);
      };
      onHeroScroll();
      window.addEventListener("scroll", onHeroScroll, { passive: true });
      window.addEventListener("resize", onHeroScroll);
    } else {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  /* Current year in the footer */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Hero mascot: play once (muted) then hold the final frame, revealing the logo
     and a replay control. Hovering (or tapping) the control re-runs the animation.
     Reduced-motion / blocked autoplay jump straight to the final frame. */
  var heroVid = document.querySelector("video.hero__mascot");
  if (heroVid) {
    var heroArt = heroVid.closest(".hero__art");
    var setStopped = function () { if (heroArt) heroArt.classList.add("is-stopped"); };
    var setPlaying = function () { if (heroArt) heroArt.classList.remove("is-stopped"); };
    var holdLastFrame = function () {
      var end = (isFinite(heroVid.duration) && heroVid.duration > 0) ? heroVid.duration - 0.05 : 0;
      try { heroVid.currentTime = end; } catch (e) {}
      heroVid.pause();
      setStopped();
    };
    var jumpToEnd = function () {
      if (heroVid.readyState >= 1) holdLastFrame();
      else heroVid.addEventListener("loadedmetadata", holdLastFrame);
    };
    var replay = function () {
      setPlaying();
      try { heroVid.currentTime = 0; } catch (e) {}
      var p = heroVid.play && heroVid.play();
      if (p && p.catch) p.catch(jumpToEnd);
    };

    heroVid.addEventListener("ended", setStopped);

    var replayBtn = document.querySelector(".hero__replay");
    if (replayBtn) {
      replayBtn.addEventListener("mouseenter", replay);
      replayBtn.addEventListener("click", replay);
    }

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      heroVid.removeAttribute("autoplay");
      heroVid.pause();
      jumpToEnd();
    } else {
      var played = heroVid.play && heroVid.play();
      if (played && played.catch) played.catch(jumpToEnd);
    }
  }

  /* Recovery estimator (illustrative, client-side only) */
  var est = document.getElementById("estimator");
  if (est) {
    var elUnits = document.getElementById("est-units");
    var elOver = document.getElementById("est-over");
    var elMonths = document.getElementById("est-months");
    var elTotal = document.getElementById("est-total");
    var elMonthly = document.getElementById("est-monthly");
    var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
    var num = function (el) { return Math.max(0, parseFloat(el && el.value) || 0); };
    var recompute = function () {
      var perMonth = num(elUnits) * num(elOver);
      elTotal.textContent = money(perMonth * num(elMonths));
      elMonthly.textContent = "about " + money(perMonth) + " / month on this product";
    };
    est.addEventListener("input", recompute);
    recompute();
  }

  /* Contact form — AJAX submit with an inline success state.
     Falls back to a normal POST (with redirect to thanks.html) when JS is off. */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      // Not yet wired to a form backend: fall back to a prefilled email so the form still works.
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : ""; };
        var body = encodeURIComponent(
          "Name: " + get("name") + "\nEmail: " + get("email") +
          "\nAmazon store / website: " + get("store") + "\n\n" + get("message"));
        window.location.href = "mailto:hello@evenfee.com?subject=Free%20FBA%20fee%20audit%20request&body=" + body;
        return;
      }

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
