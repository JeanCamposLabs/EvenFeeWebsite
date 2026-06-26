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

  /* Headline reading guide: a little after load (once the entrance settles),
     sweep a blue highlight through the headline characters, left to right, to
     lead the eye across the line. CSS honours prefers-reduced-motion. */
  var heroH1 = document.querySelector(".hero h1");
  if (heroH1) setTimeout(function () { heroH1.classList.add("is-guiding"); }, 2800);

  /* Dimension measurement video (Problem section): play it once it scrolls into
     view (muted, looping). Reduced motion / no IntersectionObserver simply holds
     the first frame. */
  var problemVideo = document.querySelector("video.problem__video");
  if (problemVideo) {
    var playProblemVideo = function () { var p = problemVideo.play && problemVideo.play(); if (p && p.catch) p.catch(function () {}); };
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      problemVideo.addEventListener("ended", function () { playProblemVideo(); });
      if ("IntersectionObserver" in window) {
        var io1 = new IntersectionObserver(function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) { playProblemVideo(); io1.disconnect(); }
        }, { threshold: 0.35 });
        io1.observe(problemVideo);
      } else {
        playProblemVideo();
      }
    }
  }

  /* Brand mascot clip (now in "How it works"): play it once it scrolls into view
     (muted), then gently loop its idle tail so the scene stays alive. Reduced
     motion / no IntersectionObserver simply holds the poster frame. */
  var clip = document.querySelector("video.mascot-clip__video");
  if (clip) {
    var CLIP_LOOP = 13.0; // loop the last idle beat (she blinks)
    var playClip = function () { var p = clip.play && clip.play(); if (p && p.catch) p.catch(function () {}); };
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      clip.addEventListener("ended", function () {
        if (isFinite(clip.duration) && clip.duration > CLIP_LOOP) { try { clip.currentTime = CLIP_LOOP; } catch (e) {} }
        playClip();
      });
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) { playClip(); io.disconnect(); }
        }, { threshold: 0.35 });
        io.observe(clip);
      } else {
        playClip();
      }
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
