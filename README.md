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

## Before going live

1. **Set the real domain.** The site uses `https://www.thepricelondon.co.uk` as a placeholder in the canonical
   tag, social tags, JSON-LD, `robots.txt` and `sitemap.xml`. Replace it in one go:

   ```sh
   grep -rl "thepricelondon.co.uk" . | xargs sed -i 's#https://www.thepricelondon.co.uk#https://YOUR-DOMAIN#g'
   ```

2. **Confirm the claims that the owner should sign off:**
   - Length and terms of the repair guarantee and the guarantee on phones sold (the copy says "guaranteed" without a duration).
   - Photo ID required when selling a phone to the shop.
   - Walk-ins welcome without an appointment.

3. **Add the website to the Google Business Profile** (the listing currently says "Add website"). This links the
   site to the 4.9-star listing and is the single biggest local-SEO step.

4. Submit `sitemap.xml` in Google Search Console once the domain is live.

## Hosting

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Deploy this folder as the site root so
`robots.txt`, `sitemap.xml` and `404.html` sit at the top level.

## Updating

- **Hours:** edit the table in `index.html`, the `openingHoursSpecification` in the JSON-LD, the FAQ answer, the
  footer, and the `HOURS` object at the top of `assets/js/main.js`.
- **Rating and review count:** search `index.html` for `4.9` and `116`.
