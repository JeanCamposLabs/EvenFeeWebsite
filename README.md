# EvenFee — marketing site

A production-ready, static marketing site for **EvenFee** — an early-stage service
that helps Amazon FBA sellers recover fulfillment & storage fees they were
**overcharged** because of incorrect product dimension/weight measurements.

This site is intended to support a **Selling Partner API (SP-API) Solution Provider
application**, so it is written to be truthful, professional, and clear about data
handling. It contains **no fabricated testimonials, customer counts, logos, or
ratings** — everything is appropriate for a brand-new company.

> **Heads-up:** `EvenFee`, `hello@evenfee.com`, and the GitHub Pages URL are
> **placeholders**. Swap them in one command — see [Rebrand](#1-rebrand-placeholders).

---

## Tech & design

- **Framework-free static site** — semantic HTML5 + one hand-authored CSS file
  (`assets/styles.css`) + ~50 lines of vanilla JS. **No build step**, so it deploys
  anywhere (especially GitHub Pages) by just uploading the files.
- **No third-party runtime, fonts, cookies, or trackers** — fast, accessible, and
  consistent with the site's privacy stance (no Google Fonts / analytics calls).
- Responsive (mobile-first), accessible (skip link, focus styles, ARIA, reduced-motion),
  with SEO meta, Open Graph/Twitter cards, JSON-LD, `sitemap.xml`, and `robots.txt`.

> Why not Tailwind CDN? The Tailwind Play CDN ships a runtime and prints a
> "not for production" console warning. Hand-authored CSS keeps the site
> production-grade with zero build and zero dependencies. You can migrate to a
> Tailwind build later if you prefer.

## What's in here

```
.
├── index.html              # Home (hero, problem, how it works, benefits, security, pricing, FAQ, CTA)
├── privacy.html            # Privacy Policy (SP-API data, no buyer PII, security, retention, GDPR)
├── terms.html              # Terms of Service (short)
├── 404.html                # Branded not-found page
├── assets/
│   ├── styles.css          # All styles + design tokens (:root)
│   ├── main.js             # Mobile nav, sticky-header, footer year (progressive enhancement)
│   ├── favicon.svg         # Vector favicon
│   ├── favicon-32.png      # PNG favicon fallback
│   ├── apple-touch-icon.png
│   ├── icon-192.png / icon-512.png   # PWA / manifest icons
│   └── og-image.png        # 1200×630 social share image
├── site.webmanifest        # PWA manifest
├── robots.txt
├── sitemap.xml
├── .nojekyll               # Tell GitHub Pages to serve files as-is (no Jekyll)
├── configure.sh            # One-command rebrand (name / email / URL)
└── scripts/
    └── generate-assets.py  # Regenerate favicon, icons, and OG image
```

---

## Quick start

### Preview locally
No build needed — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```
(or `npx serve` if you prefer Node.)

### 1. Rebrand placeholders
Replace the brand name, contact email, and site URL across every file at once:

```bash
./configure.sh "EvenFee" "hello@yourdomain.com" "https://yourdomain.com"
```

- Pass the site URL **without** a trailing slash.
  - GitHub Pages project site: `https://YOURUSER.github.io/YOURREPO`
  - Custom domain: `https://yourdomain.com`
- The current placeholders are `EvenFee`, `hello@evenfee.com`, and
  `https://evenfee.com`.

### 2. Refresh the brand images (only if the name/colors changed)
Edit the constants at the top of `scripts/generate-assets.py`, then:

```bash
pip install cairosvg
python3 scripts/generate-assets.py
```

---

## Deploy

This is a plain static site — **no build command, publish the repository root**.

### GitHub Pages — via GitHub Actions (configured)
This repo includes a Pages deploy workflow at `.github/workflows/deploy.yml`. It
publishes the site on every push to `main`, and can also be run manually from the
**Actions** tab.

1. Merge to `main`. The **Deploy site to GitHub Pages** workflow runs automatically
   and publishes the site (it bundles only the site files, excluding `scripts/`,
   `configure.sh`, `README.md`, and VCS data).
2. The workflow enables Pages (source = *GitHub Actions*) on its first run. If your
   organization blocks auto-enablement, set it once under **Settings → Pages → Build
   and deployment → Source: _GitHub Actions_**, then re-run the workflow.
3. Your site goes live at your GitHub Pages URL (`https://YOURUSER.github.io/YOURREPO/`),
   and at your custom domain once configured — for this project, **`https://evenfee.com/`**.

All internal links and asset paths are **relative**, so the site works correctly
from a project sub-path (`/camposlabs/`) and from a custom root domain alike.

> Prefer no workflow? Delete `.github/workflows/deploy.yml` and instead use
> **Settings → Pages → Source: _Deploy from a branch_ → `main` / `(root)`**.

### Netlify
Drag-and-drop the folder at <https://app.netlify.com/drop>, **or** connect the repo
with **build command: _(none)_** and **publish directory: `.`**.

### Vercel
Import the repo, **Framework Preset: _Other_**, **Build command: _(none)_**,
**Output directory: `.`**. Or run `vercel` from the project root.

### Render
**New → Static Site**, connect the repo, **Build command: _(none)_**,
**Publish directory: `.`**.

### Custom domain (e.g. `evenfee.com`)
1. Point DNS at your host (GitHub Pages: a `CNAME` to `YOURUSER.github.io`, or the
   GitHub Pages `A`/`AAAA` apex records).
2. **GitHub Pages:** add the domain under **Settings → Pages → Custom domain** (this
   creates a `CNAME` file), and enable **Enforce HTTPS**.
3. Re-point the canonical/OG/sitemap URLs to the new domain:
   ```bash
   ./configure.sh "EvenFee" "hello@evenfee.com" "https://evenfee.com"
   ```

---

## ✅ Before you go live / submit to Amazon

- [ ] **Run `configure.sh`** with your real brand name, email, and final URL.
- [ ] **Use a real, monitored inbox** for the contact email — Amazon and prospects
      will email it. The contact CTAs are `mailto:` links.
- [ ] **Confirm the hosting sub-processor** named in `privacy.html`. It currently
      lists **Amazon Web Services (AWS), EU region** as a placeholder — change it if
      you host elsewhere (search the file for `AWS`; there's a `TODO` comment there).
- [ ] **Add your legal identity** (registered name / details) to the data-controller
      section of `privacy.html` and the footer if required for your jurisdiction.
- [ ] **Have a lawyer review** `privacy.html` and `terms.html`. They are solid,
      consistent drafts — not legal advice.
- [ ] Verify HTTPS is enforced (GitHub Pages does this for you).
- [ ] Re-read all copy to confirm it matches your **actual** data handling:
      read-only-style SP-API access, **no buyer PII**, encrypted in transit & at rest,
      minimal data, success-based pricing, and **deletion on revocation**.

---

## Editing content

- **Colors / spacing / radius:** the design tokens live in `:root` at the top of
  `assets/styles.css`.
- **Copy & sections:** edit `index.html` directly — sections are clearly commented
  (`<!-- ===== Hero ===== -->`, etc.).
- **Legal pages:** `privacy.html` and `terms.html` are standalone documents.

---

© EvenFee. Operated by an independent sole proprietor based in Portugal (EU).
Amazon, FBA, and related marks are trademarks of Amazon.com, Inc. or its affiliates;
EvenFee is independent and not affiliated with, endorsed by, or sponsored by Amazon.
