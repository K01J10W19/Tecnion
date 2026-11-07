# CLAUDE.md

Technion: website for an SMD PCB-assembly company in St. Petersburg. A multi-page app (MPA) built with Vite 8, vanilla JS (ES modules), semantic HTML5 and modern CSS. No frameworks, preprocessors or CSS-in-JS.

The source designs are `Main_Page.jpg` (desktop home), `Mobile_View.jpg` (mobile columns) and `Others_Pages.jpg` (inner pages). The originals are in Russian and the site is translated to English.

## Commands

- `npm run dev`: dev server (`npm run dev -- --open` opens a browser)
- `npm run build`: production build to `dist/`
- `npm run preview`: serve `dist/` locally
- `npm run lint`: ESLint, Stylelint (token and grid rules) and a Prettier check. Must pass.
- `npm run format`: format everything with Prettier

Requires Node >= 22.12 (Vite 8, ESLint 10).

### Setup from scratch

This folder was scaffolded manually because `create-vite` wipes non-empty folders:

```
npm init -y
npm pkg set name=technion-mpa private=true type=module engines.node=">=22.12"
npm i -D vite@^8 eslint@^10 @eslint/js@^10 globals@^17 prettier@^3 stylelint@^17 lucide-static@^1
npm i @fontsource-variable/montserrat @fontsource-variable/manrope
```

In an empty folder you can run `npm create vite@latest <name> -- --template vanilla` instead, then the same installs.

## Architecture

- **Pages are folders.** `about/index.html` is served at `/about/`, so the folder path is the URL. Every page is registered in `vite.config.js` under `pages`. `appType: 'mpa'` means unknown URLs return 404, and static hosts serve `404.html`.
- **Build-time partials** (`plugins/html-partials.js`):
  - `<!-- @include header.html -->` inlines a file from `src/partials/`.
  - `<body data-page="x">` adds `aria-current="page"` to every `data-nav-id="x"`, so the active nav state ships in the HTML with no JS.
  - Editing a partial reloads every open page in dev.
- **Icon sprite** (`plugins/icon-sprite.js`):
  - The Lucide names listed in `vite.config.js` (`icons`) and every SVG in `src/assets/icons/` become `<symbol id="icon-NAME">` elements injected into each page.
  - Use them with `<svg class="icon" aria-hidden="true"><use href="#icon-NAME"></use></svg>`, or `icon('NAME')` from `ui/icon.js`.
  - An unknown name fails the build.
- **JavaScript** (`src/scripts/`):
  - `main.js` is the single entry, loaded by `partials/head.html`. It initializes the shell and core, then mounts islands.
  - `shell/` holds site chrome present on every page: header scroll state, nav panel, order dialog and form.
  - `core/` has `registry.js` (lazy islands) and `reveal.js` (scroll-triggered entrances).
  - `components/` holds lazy islands. **The file name is the `data-component` value**, and each file exports `mount(element)`. Pages that don't use a component never download it.
  - `ui/` holds pure DOM-generation functions built with `h()`, with no side effects.
  - `lib/` has `dom.js` (`h`, `svg`, `qs`, `qsa`), `observer.js` (the only owner of IntersectionObserver), `motion.js` and `latency.js`.
  - `services/` handles data and network: `products.js` and `order.js`.
- **CSS** (`src/styles/`):
  - Cascade layers `tokens, reset, base, layout, components, pages, utilities`. A later layer wins regardless of specificity.
  - `main.css` is global and linked in `head.html`. `pages/<page>.css` is linked by its page and `@import`s components only that page uses.
  - Every file wraps its rules in its own `@layer`. Page stylesheets repeat the layer-order statement first, so the cascade holds whatever order the bundler emits.

## Directory structure

```
MPA_VanillaJS/
├── index.html                  # /               Home
├── about/index.html            # /about/
├── pcb-assembly/index.html     # /pcb-assembly/  (#stages, #technologies, #standards)
├── products/index.html         # /products/      (renders public/data/products.json)
├── delivery/index.html         # /delivery/
├── contacts/index.html         # /contacts/
├── legal/index.html            # /legal/         (#privacy, #personal-data)
├── 404.html
├── vite.config.js              # pages + icon list + plugins
├── plugins/                    # html-partials.js, icon-sprite.js, paths.js
├── eslint.config.js  stylelint.config.js  .prettierrc.json  .editorconfig
├── .env.example  .env.development
├── public/                     # copied as-is: favicon, robots.txt, data/, images/products/, files/
└── src/
    ├── partials/               # head, header, logo, footer, order-dialog
    ├── assets/icons/           # custom sprite symbols (logo-mark, flag-ru)
    ├── assets/images/          # SVG placeholders (hashed at build)
    ├── styles/
    │   ├── main.css            # layer order + global imports
    │   ├── tokens.css          # ALL raw values live here
    │   ├── base/               # reset, base (focus, links), typography (text roles)
    │   ├── layout/             # container, section, primitives (stack, cluster, scroller, grid)
    │   ├── components/         # one file per component (BEM block)
    │   ├── utilities/          # a11y, motion (reveal/enter/float), feedback (spinner/skeleton)
    │   └── pages/              # one stylesheet per page
    └── scripts/                # main.js + shell/ core/ components/ ui/ lib/ services/
```

## Design tokens (`src/styles/tokens.css`)

This is the single source of truth and the only file allowed raw colors or lengths. Stylelint enforces that.

### Color

Sampled from the mockups. Contrast is measured against white.

| Token                                   | Value                       | Use                                                          |
| --------------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `--color-primary`                       | #1599C0                     | Brand cyan: icons, outlines, icon tiles, large text (3.31:1) |
| `--color-primary-strong`                | #0C80A4                     | Button fills, small links, focus ring (4.53:1, AA)           |
| `--color-primary-stronger`              | #096C8B                     | Hover and pressed states                                     |
| `--color-primary-soft`                  | #E7F4F8                     | Tints: hashtags, outline-button hover                        |
| `--color-heading`                       | #118BAD                     | Section headings, large text only (3.95:1)                   |
| `--color-accent`                        | #0F79A1                     | Deep-ocean banner                                            |
| `--color-secondary`                     | #333333                     | Graphite footer, outline buttons                             |
| `--color-bg` / `-bg-muted`              | #FFFFFF / #FAFAFA           | Page / muted sections and info cards                         |
| `--color-text` / `-strong` / `-muted`   | #333333 / #111111 / #5F676D | Body / titles / nav and captions (5.76:1)                    |
| `--color-border` / `-subtle` / `-field` | #9DBFC8 / #E3E8EB / #7C868C | Card outlines / dividers / form controls (3.7:1)             |
| `--color-success` / `--color-error`     | #17724A / #B42F2F           | Status text, >= 4.5:1 on their soft backgrounds              |

**Rule:** text on brand cyan, and small text in brand cyan, uses `--color-primary-strong`. `--color-primary` and `--color-heading` are only for large text, icons and borders. This was a deliberate deviation from the mockup's button color, made for WCAG AA.

### Typography

Montserrat Variable (`--font-display`, for headings and the logo) and Manrope Variable (`--font-body`). Both are self-hosted through Fontsource, with no third-party requests, and stand in for the mockup's Gilroy-style faces. To use licensed fonts, change the two family tokens.

| Token                         | Mobile → Desktop | Role                   |
| ----------------------------- | ---------------- | ---------------------- |
| `--text-xs` / `-sm` / `-base` | 12 / 14 / 16     | Legal, card text, body |
| `--text-lg`                   | 16 → 18          | Lead copy              |
| `--text-xl`                   | 18 → 20          | Card titles            |
| `--text-2xl`                  | 20 → 24          | Sub-headings           |
| `--text-3xl`                  | 22 → 32          | Product titles         |
| `--text-4xl`                  | 24 → 40          |                        |
| `--text-5xl`                  | 26 → 48          | Section titles         |
| `--text-6xl`                  | 28 → 60          | Hero                   |
| `--text-display`              | 96 → 160         | 404 numerals           |

Fluid values interpolate linearly between the **375px and 1440px artboards**: `clamp(min, intercept + slope·vw, max)`, where slope = (max − min) / 1065px and intercept = min − slope·375px. Desktop maxima were measured from mockup line heights.

Text-role classes: `.title-hero`, `.title-section`, `.title-sub`, `.title-card`, `.lead`, `.text-sm`, `.text-muted`, `.eyebrow`, `.prose`.

### Spacing: strict 8px grid

`--space-N` is N × 8px, in rem (1rem = 16px), for N ∈ {1, 2, 3, 4, 5, 6, 8, 10, 12, 15}, so 8 to 120px. The fluid tokens sit on the grid at both ends: `--space-gutter` 16→32, `--space-stack` 24→48, `--space-section` 48→96, `--space-section-lg` 64→120.

`margin*`, `padding*`, `gap` and `scroll-*` may only use these tokens. A raw px/rem/em value fails `npm run lint`. Stroke widths, radii and transforms are not spacing.

### Shape, elevation, motion

- **Radii:** `--radius-xs|sm|md|lg|pill` = 4 / 8 / 16 / 24 / pill.
- **Shadows:** `--shadow-card|hover|header|dialog|board`.
- **Z-index:** `--z-raised|sticky|nav|skip`.
- **Easing:**
  - `--ease-out-expo`: entrances and reveals
  - `--ease-out-quart`: hovers
  - `--ease-in-quart`: exits
  - `--ease-in-out-sine`: loops
  - `--ease-in-out-cubic`: toggles
  - `--ease-spring`: a `linear()` damped spring for dialogs, checkmarks and the logo
- **Durations:** `--duration-instant|fast|base|slow|slower|reveal` = 100 / 160 / 240 / 400 / 700 / 800 ms.
- **Motion distances:** `--reveal-distance`, `--reveal-stagger`, `--lift-sm|md`, `--press-scale`.
- **Reduced motion** sets these tokens to roughly 0, which neutralizes every transition, animation and reveal at once.

## Responsive tiers

Mobile-first. Media queries use literal px, and each component file holds its own tier overrides.

| Tier      | Range       | `--container-max` | Layout                                                                                                     |
| --------- | ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| 1 Mobile  | < 640px     | 100% − gutters    | Stacked, centered titles, scroll-snap rows, sticky bar with menu panel, bottom-sheet dialog, 48px controls |
| 2 Tablet  | 640–1023px  | 100% − gutters    | Two-up carousels and grids, carousel arrows, phone number visible, centered modal                          |
| 3 Laptop  | 1024–1439px | 60rem (960px)     | Static two-row header with inline nav, multi-column sections, 40px controls                                |
| 4 Monitor | >= 1440px   | 65rem (1040px)    | Container measured from `Main_Page.jpg` (72.5% of the 1440 artboard)                                       |

## Rules

### Code style

- ES modules only. Flat BEM CSS with no nesting. Flexbox and Grid only for layout. Prettier settings: single quotes, semicolons, width 100.
- JS hooks use `data-*` attributes. State lives in `dataset` or ARIA (`data-nav-open`, `data-scrolled`, `data-loading`, `data-static`, `aria-expanded`, `aria-busy`, `aria-invalid`), and CSS styles those states.
- Build DOM with `h()` and `svg()`. **Never** use `innerHTML` or `insertAdjacentHTML` (ESLint error).
- Scroll-driven behavior goes through `lib/observer.js` only. No scroll listeners. `new IntersectionObserver` anywhere else is an ESLint error.
- Every color, spacing, radius, shadow, duration and easing comes from a token. Add a token rather than hardcoding.

### Motion

- Transitions use the `--duration-*` and `--ease-*` tokens. Never add `!important` reduced-motion overrides; the tokens already handle it.
- **Below the fold:** add `reveal` (optionally with `reveal--fade`, `--scale`, `--left` or `--right`). `data-reveal-stagger` on a parent staggers its direct `.reveal` children. For injected DOM, call `observeReveal(root)`.
- **Above the fold:** use `enter` with `enter--1` to `enter--4`. This is CSS-only, so it doesn't wait for JS and doesn't delay LCP.
- Hidden starting states apply only under `@media screen and (scripting: enabled)`, so no-JS visitors and print always get the content.
- Reveals animate the `translate` and `scale` properties while hover lifts use `transform`, so the two never conflict.

### Accessibility

- One `<h1>` per page, plus header/nav/main/footer landmarks and a skip link.
- Every interactive element styles `:hover`, `:active` and `:focus-visible`. The focus ring is 2px `--color-focus` with a 3px offset, and it turns white on dark surfaces by re-scoping `--color-focus`. Mouse `:focus` shows no ring. Form fields also style `:focus` and `:user-invalid`.
- Dialogs use native `<dialog>` with `showModal()`. Open with `data-dialog-open="<id>"` and close with `data-dialog-close`; light-dismiss is built in.
- The mobile nav panel makes `main` and the footer `inert` while open. Escape closes it and returns focus to the toggle.
- Lists styled without bullets need `role="list"`, which keeps their semantics in Safari.
- Live regions are owned by containers (`[data-form-status]`, `#products-status`), never by large content lists.

### System feedback

- **Spinner:** `.spinner` (`--lg`). For buttons, set `data-loading="true"`; the button contains a `.btn__label` and a `.spinner`.
- **Skeletons:** `.skeleton` with `--text`, `--text-short`, `--title`, `--media`, `--pill` or `--block`, inside an `aria-busy="true"` container. Pre-render them in the HTML so they appear before JS (see `products/index.html`).
- **Status:** `statusMessage({ tone, title, message, action })` from `ui/status.js`, where tone is `success`, `error` or `info`.
- **Dev only:** `VITE_SIMULATED_LATENCY` (in `.env.development`) slows the services down so these states stay visible.

## How-to

### Add a page

1. Create `<slug>/index.html` by copying an existing page. It needs `<!-- @include head.html -->` in `<head>`, `<body data-page="<slug>">`, and the header, footer and order-dialog includes.
2. Register it in `vite.config.js` under `pages`.
3. Create `src/styles/pages/<slug>.css`, starting with the `@layer` order statement, and link it in the page `<head>`.
4. If it belongs in navigation, add links with `data-nav-id="<slug>"` to `src/partials/header.html` and `footer.html`.

### Add a component (lazy island)

1. Create `src/scripts/components/<name>.js` exporting `mount(element)`.
2. Put `data-component="<name>"` on its root element.
3. Add styles in `src/styles/components/<name>.css`. Import it from `main.css` if it's shared, or from the page stylesheet if only one page uses it.

### Add an icon

- **Lucide:** add the name to `icons` in `vite.config.js` (names are on https://lucide.dev).
- **Custom:** drop an SVG into `src/assets/icons/`; its id is the file name. Keep its fills on child elements.

### Connect the order form

Set `VITE_ORDER_ENDPOINT` in `.env.local`, following `.env.example`. It receives `multipart/form-data` with `name`, `phone`, `email`, `company`, `message`, `files[]` and `consent`. Without it, the form runs in demo mode: a simulated success with no request.

### Edit products

Edit `public/data/products.json`. Its shape is documented by the existing entries. `task` and `problem` may each be a string or an array. Images referenced from the JSON live in `public/images/products/` and are served unhashed.

### Deploy

Upload `dist/` to any static host at the **domain root**; links are root-absolute (`/about/`). Serving from a subpath needs `base` in `vite.config.js` and updated links.

## Content and assets to replace before launch

- **Images:** the SVG placeholders in `src/assets/images/` and `public/images/products/`. Aspect ratios are locked, so real photos (AVIF or WebP) drop in without layout shift.
- **Logo:** `src/assets/icons/logo-mark.svg` and `public/favicon.svg`.
- **Proposal:** `public/files/technion-proposal.pdf`, which the "Download proposal" buttons link to.
- **Contacts:** the Telegram links (`https://t.me/`), the email (`info@example.com`), and the street address (only "St. Petersburg, Russia" today).
- **Phone numbers:** the mockup shows two. The header and Contacts page use +7 929 119-44-05, and the footer uses +7 999 123-45-67. Confirm which is real.
- **Legal:** `/legal/` contains template texts.
- **Copy to verify with the client:** everything was translated from the Russian mockups. Several parts were reconstructed because the mockup text was illegible or absent:
  - Small text on inner pages: the About intro, strengths and experience lists, and product details for devices 2 and 3.
  - Extra carousel slides: "Why choose us" 3–4, capabilities 2–3 and About directions 2–3.
- **SEO:** canonical URLs and the sitemap need the production domain.

## Maintenance notes

- `npm audit` reports `braces` (GHSA-vfj7-8cjw-p6xm) through stylelint's glob dependencies, with no upstream fix yet. It's a dev-only tool and the only glob it receives is our own hard-coded pattern, so nothing ships to the browser. Re-check after upgrading stylelint.
- Fontsource ships every subset. Browsers download only the subsets a page needs (Latin here) via `unicode-range`.

## Agent rules

- Run `npm run lint && npm run build` before marking any task complete.
- Check `tokens.css` before writing any value. Keep the 8px grid.
- Never add a framework, preprocessor or runtime dependency without asking.
- Keep this file current when the architecture, tokens or conventions change.
