# P & J Financial Solutions website (2027 refresh)

Static HTML/CSS/JS site for pjfinancialsolutions.com.au, built to replace the Divi/WordPress site and styled to the **P & J Brand Refresh (November 2026)**: P & J Blue #0C71C3, Deep Navy #112D4E, Sky Wash #EAF3FA, Warm White #F8F7F4, Slate #526170; Manrope 600 headings, Inter body; original serif wordmark. Hosted on Vercel (`pj-financial-site`, lemonlolly team), auto-deploys from GitHub `lemonlollyau/pj-financial-site` `main`.

## What's here

| File | Page / purpose |
|---|---|
| `index.html` | Home |
| `home-loans.html`, `commercial-finance.html`, `equipment-finance.html` | Service pages (with FAQ structured data) |
| `calculator.html` | Repayment calculator (replaces the broken http:// frograte iframe) |
| `about.html`, `team.html`, `testimonials.html` | About, brokers, client stories |
| `contact.html` | Enquiry form + office details |
| `privacy.html` | Privacy, Credit Guide and complaints (IDR/AFCA) |
| `404.html` | Not-found page (Vercel serves it automatically) |
| `styles.css`, `site.js` | Shared styles and scripts, no dependencies |
| `fonts/` | Self-hosted Manrope + Inter (SIL OFL), Latin subset |
| `img/` | Logo (raster from the brand guide), home hero image, social share image, app icon |
| `api/enquiry.js` | Vercel function that emails form enquiries via Resend |
| `vercel.json` | Clean URLs, 301s from every old WordPress URL, security headers |
| `sitemap.xml`, `robots.txt`, `site.webmanifest`, `favicon.png`, `favicon.ico` | SEO and icons |

Header and footer are repeated in each page. If you change the nav or footer, change it in every `.html` file (Claude can do this in one go).

## Deploy

1. Create a private GitHub repo (e.g. `pj-financial-site`) and push this folder to `main`.
2. Vercel → Add New → Project → Import the repo. Framework preset **Other**, no build command, output directory `.`. Deploy.
3. Vercel → Settings → Environment Variables (Production):
   - `RESEND_API_KEY` – from resend.com
   - `ENQUIRY_TO` – `admin@pjfinancialsolutions.com.au` (comma-separate for more)
   - `ENQUIRY_FROM` – e.g. `P&J Website <website@pjfinancialsolutions.com.au>` (verify the domain in Resend first by adding its DNS records)
   Redeploy, then send a test enquiry from `/contact`.
4. Check the `*.vercel.app` preview with the client and get sign-off (see checklist below).
5. Domain: Vercel → Settings → Domains → add `pjfinancialsolutions.com.au` and `www.pjfinancialsolutions.com.au`. At the DNS host, point the apex A record to `76.76.21.21` and `www` CNAME to `cname.vercel-dns.com` (use whatever Vercel shows). **Leave MX/email records alone.** Set `www` to redirect to the apex so SEO isn't split.
6. Google Search Console: verify the domain, submit `https://pjfinancialsolutions.com.au/sitemap.xml`.

## Before launch: confirm with the client

- [ ] **Paul's credit representative number.** The old team page shows 472762 (the same number as Freddy's); the 2018 dispute policy shows 452181. The new site uses **452181**. Check both on the ASIC Professional Register.
- [ ] **Paul's email.** Site uses `paul@pjfs.com.au`; the dispute policy uses `paul@pjfinancialsolutions.com.au`.
- [ ] **Complaints policy.** The current PDF was last reviewed 1 Oct 2018 and uses 21/30/45-day timeframes from before ASIC RG 271 (Oct 2021). Ask BLSSA for the current complaints policy, Privacy Policy and Credit Guide, and confirm BLSSA's complaints contact details (Level 15, 360 Elizabeth St Melbourne, 03 9320 1082, resolutions@BLSSA.com.au, copied from the 2018 PDF). Add the PDFs to `/downloads/` and link them from `privacy.html`.
- [ ] **Postal address** PO Box 594, South Fremantle WA 6162 (from the 2018 PDF) is still current.
- [ ] **Awards wording.** Site says "finalist in industry business excellence awards in 2015, 2018, 2019, 2020 and 2022, in residential and commercial categories", read from the old badge filenames. Get exact award names to list properly.
- [ ] **Lender panel.** Site lists ANZ, Commonwealth Bank, NAB, Westpac, ING, Suncorp, St.George, Resimac. Three old logos were unlabelled screenshots; add any missing lenders.
- [ ] **Team headshots.** Initials tiles are 4:5; drop in natural portraits at the same ratio (min 800×1000px), consistent light and background per the brand guide.
- [ ] **Vector logo.** `img/pj-logo.png` is the 379×85 raster from the brand guide (cropped). Swap in the original vector (SVG) for sharp rendering at 220px.
- [ ] **Hero photography.** The home hero house is the AI-generated creative reference from the brand guide. Replace with commissioned or licensed photography before launch.
- [ ] **Office hours** (not on the old site; add to contact page if wanted).
- [ ] Analytics (GA4) and Google Business Profile link, if used.

## Notes

- All copy keeps to claims on the old site (founded 2013, 90+ years' combined experience, MFAA member and 10 Year Circle, accredited with most major equipment lenders). No rates, "best deal" or "free service" claims.
- Calculator: estimate only, true weekly/fortnightly maths, extra-repayment savings, disclaimer on page. Default 6.00% rate is labelled as an example.
- Testimonials are the existing seven, lightly corrected for spelling.
