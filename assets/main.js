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

  /* Hero: the brand intro plays once, then hands off — the video lifts away and
     the recovery tool rises in to take the space. The same beat starts the
     headline reading guide. Reduced-motion / blocked autoplay reveal the tool
     right away rather than make anyone wait. */
  var heroVid = document.querySelector("video.hero__mascot");
  if (heroVid) {
    var hero = heroVid.closest(".hero");
    var heroH1 = document.querySelector(".hero h1");
    var HANDOFF_AT = 12.6; // seconds — the EvenFee logo has finished dropping in

    var revealed = false;
    var revealHero = function () {
      if (revealed) return;
      revealed = true;
      if (heroH1) heroH1.classList.add("is-guiding");    // light up the headline, left to right
      if (hero) hero.classList.add("is-tool-revealed");  // video lifts away, tool rises in
      try { heroVid.pause(); } catch (e) {}              // the (now hidden) intro is done
    };
    var replay = function () {
      try { heroVid.currentTime = 0; } catch (e) {}
      var p = heroVid.play && heroVid.play();
      if (p && p.catch) p.catch(function () {});
    };

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      heroVid.removeAttribute("autoplay");
      revealHero(); // show the tool immediately; CSS disables the motion
    } else {
      var onHandoff = function () {
        if (heroVid.currentTime >= HANDOFF_AT) {
          revealHero();
          heroVid.removeEventListener("timeupdate", onHandoff);
        }
      };
      heroVid.addEventListener("timeupdate", onHandoff);
      setTimeout(revealHero, 15000); // backstop if timeupdate never reaches the cue
      var played = heroVid.play && heroVid.play();
      if (played && played.catch) played.catch(function () {
        setTimeout(revealHero, 1800); // autoplay blocked — hand off after a short beat
      });
    }

    var replayBtn = document.querySelector(".hero__replay");
    if (replayBtn) {
      replayBtn.addEventListener("click", replay);
      replayBtn.addEventListener("mouseenter", replay);
    }
  }

  /* Hero recovery tool (early access). No backend yet: the two drop-zones are
     interactive previews and submitting captures an email for a launch notice.
     Wire the real upload + analyze endpoint into the submit handler when ready. */
  var heroTool = document.getElementById("hero-tool");
  if (heroTool) {
    var drops = heroTool.querySelectorAll(".hero__drop");
    Array.prototype.forEach.call(drops, function (drop) {
      var input = drop.querySelector('input[type="file"]');
      var nameEl = drop.querySelector(".hero__drop-name");
      var markFilled = function (file) {
        if (!file) return;
        drop.classList.add("is-filled");
        if (nameEl) nameEl.textContent = file.name;
      };
      if (input) input.addEventListener("change", function () { markFilled(input.files && input.files[0]); });
      ["dragenter", "dragover"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-dragover"); });
      });
      ["dragleave", "dragend"].forEach(function (ev) {
        drop.addEventListener(ev, function () { drop.classList.remove("is-dragover"); });
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files && files[0]) {
          if (input) { try { input.files = files; } catch (err) {} }
          markFilled(files[0]);
        }
      });
    });

    heroTool.addEventListener("submit", function (e) {
      e.preventDefault();
      // TODO: POST the email (and, once live, the uploaded reports) to your
      // endpoint here via heroTool.action. For now, confirm inline.
      var body = heroTool.querySelector(".hero__tool-body");
      var success = heroTool.querySelector(".hero__tool-success");
      if (body) body.hidden = true;
      if (success) { success.hidden = false; success.setAttribute("tabindex", "-1"); success.focus(); }
    });
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

  /* Mobile sticky CTA: reveal once past the hero, hide while the contact form is on screen
     (so it never doubles up with the in-page CTA) and over the footer. */
  var mcta = document.querySelector("[data-mobile-cta]");
  if (mcta) {
    var heroForCta = document.querySelector(".hero");
    var contactSection = document.getElementById("contact");
    var updateCta = function () {
      var pastHero = heroForCta ? window.scrollY > heroForCta.offsetHeight - 120 : window.scrollY > 320;
      var contactOnScreen = false;
      if (contactSection) {
        var r = contactSection.getBoundingClientRect();
        contactOnScreen = r.top < window.innerHeight * 0.85 && r.bottom > 0;
      }
      var show = pastHero && !contactOnScreen;
      mcta.classList.toggle("is-visible", show);
      mcta.setAttribute("aria-hidden", String(!show));
    };
    updateCta();
    window.addEventListener("scroll", updateCta, { passive: true });
    window.addEventListener("resize", updateCta);
  }

  /* Auto-update to the latest deploy.
     Each deploy stamps the commit's short SHA into <meta name="app-build"> on
     every page and into /build.txt. We poll build.txt (cache-bypassed); when it
     no longer matches the build this page was served from, a newer version is
     live, so we reload — pulling the new HTML and its freshly versioned
     CSS/JS/media. A per-build guard prevents reload loops if an edge cache is
     briefly stale. No meta tag (e.g. local dev) → the check is skipped. */
  var buildMeta = document.querySelector('meta[name="app-build"]');
  var loadedBuild = buildMeta && buildMeta.getAttribute("content");
  if (loadedBuild) {
    var didReload = function (b) {
      try { return sessionStorage.getItem("evenfee:reloaded:" + b) === "1"; }
      catch (e) { return false; }
    };
    var checkBuild = function () {
      fetch("build.txt?_=" + Date.now(), { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (text) {
          if (!text) return;
          var latest = text.trim();
          if (!latest || latest === loadedBuild || didReload(latest)) return;
          try { sessionStorage.setItem("evenfee:reloaded:" + latest, "1"); } catch (e) {}
          location.reload();
        })
        .catch(function () {});
    };
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") checkBuild();
    });
    window.addEventListener("pageshow", checkBuild);
    setInterval(checkBuild, 60000);
    checkBuild();
  }
})();
