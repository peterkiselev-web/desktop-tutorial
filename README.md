# The Price: website

Single-page website for **The Price**, phone repair specialists and guaranteed phone reseller at
8 Sutherland Avenue, Maida Vale, London W9 2HQ.

Plain HTML, CSS and a little vanilla JavaScript. No build step and no frameworks. Fonts are self-hosted, so
the page makes no third-party requests until a visitor clicks "Show the map".

## Structure

```
index.html            The page, including SEO meta tags and JSON-LD structured data
404.html              Not-found page
assets/css/style.css  All styles
assets/js/main.js     Open/closed status (London time), mobile menu, text-a-quote form, click-to-load map
assets/fonts/         Inter (variable) and Instrument Serif Italic, self-hosted
assets/img/           Responsive WebP photos (metadata stripped)
og-image.jpg          1200x630 social share image
favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest
robots.txt, sitemap.xml
```

## Live site (GitHub Pages)

**https://peterkiselev-web.github.io/desktop-tutorial/**

GitHub Pages publishes the `gh-pages` branch, which holds the contents of this folder at its root
(Settings > Pages > Source: "Deploy from a branch", branch `gh-pages`, folder `/ (root)`).

To publish changes, commit them on the working branch, then push this folder to `gh-pages` from the repo root:

```sh
git subtree push --prefix the-price origin gh-pages
```

The live site updates a minute or two later. `.nojekyll` tells GitHub Pages to serve the files as they are.

## Moving to a custom domain

The canonical tag, social tags, JSON-LD, `robots.txt` and `sitemap.xml` all use the GitHub Pages address. When a
domain is ready (for example `www.thepricew9.co.uk`):

1. Swap the address everywhere, from inside this folder:

   ```sh
   grep -rl "peterkiselev-web.github.io/desktop-tutorial" . | xargs sed -i 's#https://peterkiselev-web.github.io/desktop-tutorial#https://www.YOUR-DOMAIN#g'
   ```

2. In `404.html`, change `<base href="/desktop-tutorial/">` to `<base href="/">`.
3. Add a `CNAME` file in this folder containing just the domain, point the domain's DNS at GitHub Pages, and
   set the domain under Settings > Pages.

## Before telling customers about it

1. **Confirm the claims that the owner should sign off:**
   - Length and terms of the repair guarantee and the guarantee on phones sold (the copy says "guaranteed" without a duration).
   - Photo ID required when selling a phone to the shop.
   - Walk-ins welcome without an appointment.

2. **Add the website to the Google Business Profile** (the listing currently says "Add website"). This links the
   site to the 4.9-star listing and is the single biggest local-SEO step.

3. Add the site in Google Search Console and submit `sitemap.xml`.

Note: on a `github.io` project address, search engines only read `robots.txt` at the very root of the host, so
the copy in this folder starts working once the site has its own domain. The sitemap works either way.

## Updating

- **Hours:** edit the table in `index.html`, the `openingHoursSpecification` in the JSON-LD, the FAQ answer, the
  footer, and the `HOURS` object at the top of `assets/js/main.js`.
- **Rating and review count:** search `index.html` for `4.9` and `116`.
