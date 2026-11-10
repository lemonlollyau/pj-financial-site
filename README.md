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
| `img/team/` | Staff portraits (from the old site, upscaled, cut out and placed on the brand Sky Wash background) |
| `img/badges/` | FAST Business Excellence Awards finalist badges (2015–2022) and MFAA badges, cut to clean circles; shown in the footer band on every page |
| `api/enquiry.js` | Vercel function that emails form enquiries via Resend |
| `vercel.json` | Clean URLs, 301s from every old WordPress URL, security headers |
| `sitemap.xml`, `robots.txt`, `site.webmanifest`, `favicon.png`, `favicon.ico` | SEO and icons |

Header and footer are repeated in each page. If you change the nav or footer, change it in every `.html` file (Claude can do this in one go).

## Deploy

1. Create a private GitHub repo (e.g. `pj-financial-site`) and push this folder to `main`.
2. Vercel → Add New → Project → Import the repo. Framework preset **Other**, no build command, output directory `.`. Deploy.
3. Enquiry emails (see **Enquiry form email** below). Only `RESEND_API_KEY` is required; enquiries go to `admin@pjfinancialsolutions.com.au` by default.
4. Check the `*.vercel.app` preview with the client and get sign-off (see checklist below).
5. Domain: Vercel → Settings → Domains → add `pjfinancialsolutions.com.au` and `www.pjfinancialsolutions.com.au`. DNS for the domain is on **VentraIP** nameservers (`ns1/ns2/ns3.nameserver.net.au`, used for VentraIP reseller hosting, so access may sit with whoever hosts the old WordPress site), not SiteGround. In that DNS manager, point the apex A record to `76.76.21.21` and `www` CNAME to `cname.vercel-dns.com` (use whatever Vercel shows). **Do not touch the MX, root SPF (`v=spf1 include:spf.protection.outlook.com -all`) or autodiscover records**: P & J's email runs on Microsoft 365. Redirect `www` to the apex in Vercel.
6. Google Search Console: verify the domain, submit `https://pjfinancialsolutions.com.au/sitemap.xml`.

## Enquiry form email

The contact and homepage forms post to `api/enquiry.js`, which emails each enquiry to **admin@pjfinancialsolutions.com.au** from `website@pjfinancialsolutions.com.au`, with Reply-To set to the enquirer. If sending fails, the visitor is told to call or email instead, so no enquiry is silently lost.

Setup status (10 Nov 2026): `pjfinancialsolutions.com.au` has been added to lemonlolly's Resend account (region Tokyo, ap-northeast-1, the closest offered; receiving **off**, click/open tracking **off**). Waiting on client approval, then DNS.

1. **DNS at VentraIP**: add these three records (host names are relative to pjfinancialsolutions.com.au; TTL default/Auto). They don't change the root domain's MX, SPF or DMARC, so Microsoft 365 email is unaffected.

   | Type | Host / Name | Value |
   |---|---|---|
   | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqnDFeA9emZL85QlGB0pe6VQS+nv2RvlTfIxc7stBoL6HFKboE3M2DHfOb6GA/cCbjfov3WeAGS5R9E8JGvmMZgzvJ5pl13bZg2NcMl00DF7b3J8ThopjA+bYgkvleRHYaA7zecLsV6NOXEAwTT30kEhlo4o8X6Y6s3yFfyO+RVQIDAQAB` |
   | CNAME | `rsend` | `rsend-apne1.forge.rmta.net` |
   | CNAME | `send` | `send.forge.rmta.net` |

2. **Verify**: Resend → Domains → pjfinancialsolutions.com.au → *I've added the records* / Verify. Wait for **Verified**.
3. **API key**: Resend → API Keys → Create: name `P & J website enquiries (Vercel)`, permission *Sending access*, domain `pjfinancialsolutions.com.au` (this option only appears once the domain is verified; don't use *All domains*).
4. **Vercel**: Project → Settings → Environment Variables → add `RESEND_API_KEY` (Production, Sensitive). Redeploy.
5. **Check**: `https://pj-financial-site.vercel.app/api/enquiry` should show `"configured":true`.
6. **Test**: send one enquiry from `/contact` and confirm it arrives in admin@. If it lands in Junk, mark it *Not junk* (or add `website@pjfinancialsolutions.com.au` to safe senders in Microsoft 365).

Optional overrides: `ENQUIRY_TO` (comma-separate for more recipients), `ENQUIRY_FROM`.

DMARC is currently `p=none`; Resend's DKIM signing on the domain means enquiries pass DMARC if it's tightened later.

## Before launch: confirm with the client

- [ ] **Paul's credit representative number.** The old team page shows 472762 (the same number as Freddy's); the 2018 dispute policy shows 452181. The new site uses **452181**. Check both on the ASIC Professional Register.
- [ ] **Paul's email.** Site uses `paul@pjfs.com.au`; the dispute policy uses `paul@pjfinancialsolutions.com.au`.
- [ ] **Complaints policy.** The current PDF was last reviewed 1 Oct 2018 and uses 21/30/45-day timeframes from before ASIC RG 271 (Oct 2021). Ask BLSSA for the current complaints policy, Privacy Policy and Credit Guide, and confirm BLSSA's complaints contact details (Level 15, 360 Elizabeth St Melbourne, 03 9320 1082, resolutions@BLSSA.com.au, copied from the 2018 PDF). Add the PDFs to `/downloads/` and link them from `privacy.html`.
- [ ] **Postal address** PO Box 594, South Fremantle WA 6162 (from the 2018 PDF) is still current.
- [x] **Awards.** Footer shows all eight FAST finalist badges (2015 residential + commercial, 2017–2022) and both MFAA badges; About page copy matches.
- [x] **Lender panel.** Confirmed by client (10 Nov): ANZ, Commonwealth Bank, NAB, Westpac, Macquarie Bank, ING, St.George, Ubank, P&N Bank.
- [x] **Team photos.** Client approved using the old-site photos (208–233px originals); refreshed onto the brand background. New headshots would look sharper on high-resolution screens.
- [ ] **Vector logo.** `img/pj-logo.png` is the 379×85 raster from the brand guide (cropped). Swap in the original vector (SVG) for sharp rendering at 220px.
- [ ] **Hero photography.** The home hero house is the AI-generated creative reference from the brand guide. Replace with commissioned or licensed photography before launch.
- [ ] **Office hours** (not on the old site; add to contact page if wanted).
- [ ] Analytics (GA4) and Google Business Profile link, if used.

## Notes

- All copy keeps to claims on the old site (founded 2013, 90+ years' combined experience, MFAA member and 10 Year Circle, accredited with most major equipment lenders). No rates, "best deal" or "free service" claims.
- Calculator: estimate only, true weekly/fortnightly maths, extra-repayment savings, disclaimer on page. Default 6.00% rate is labelled as an example.
- Testimonials are the existing seven, lightly corrected for spelling.
