# 🔌 Tecnion

![Status](https://img.shields.io/badge/status-pre--launch-F59E0B?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-cascade%20layers-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A522.12-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

A multi-page marketing website for **Technion LLC**, a St. Petersburg company that does turnkey SMD printed-circuit-board assembly. It is built with Vite 8, framework-free vanilla JavaScript (ES modules), semantic HTML5 and modern layered CSS. Seven content pages share build-time partials, an inline icon sprite and a single entry script that loads interactive "islands" lazily, so each page downloads only the code it uses.

---

## ✨ Features

- **Seven pages with clean URLs**: Home, About, PCB Assembly, Products & Solutions, Delivery & Payment, Contacts and Legal, plus a custom 404 page. Each page is a folder (`/about/` → `about/index.html`).
- **Order dialog on every page**: an "Order" button in the header, footer, mobile menu and page CTAs opens a modal form. It collects name, phone, email, company, project details, file attachments and consent to data processing.
- **Form validation in plain English**: errors show when you leave a field and re-check as you type. Phone numbers must have 10–15 digits, attachments are capped at 20 MB in total, and the first invalid field receives focus on submit.
- **Demo or live submission**: without `VITE_ORDER_ENDPOINT` the form simulates a successful send. With it, the form POSTs `multipart/form-data` (attachments included) with a 15-second timeout.
- **Data-driven product case studies**: the Products page renders `public/data/products.json` into case cards (task, initial problem, what we did, results, package contents, tags and hashtags). Skeleton cards show while it loads, and a failed load offers a "Try again" button.
- **Accessible carousels**: "Why choose us", production capabilities and About directions use CSS scroll-snap tracks with prev/next arrows. The arrows disable at each end and hide when every slide fits.
- **Responsive navigation**: a menu panel on phones and tablets, an inline nav bar on laptops and up. The current page is highlighted in both the header and the footer.
- **Assembly process content**: five numbered assembly stages, technologies (SMT, THT, mixed) and applied standards (IPC-A-610, J-STD-001), each with its own anchor (`#stages`, `#technologies`, `#standards`).
- **Delivery and payment panels**: pickup, courier, Delovye Linii and CDEK shipping options, plus payment methods and terms of work.
- **Downloadable proposal**: "Download proposal" buttons link to `public/files/technion-proposal.pdf`.
- **Scroll-triggered entrances**: sections fade and slide in as they enter the viewport, with optional staggering of child elements.

## 🛠️ Tech Stack

- **Build tool:** Vite 8 (`vite@^8.3.4`) in `appType: 'mpa'` mode, with two custom plugins
- **Language:** vanilla JavaScript (ES modules), no framework
- **Markup:** semantic HTML5 with build-time partials
- **Styling:** modern CSS with cascade layers, custom properties, `clamp()`, `color-mix()` and `@starting-style`. No preprocessor and no CSS-in-JS.
- **Fonts:** `@fontsource-variable/montserrat@^5` (display) and `@fontsource-variable/manrope@^5` (body), self-hosted
- **Icons:** `lucide-static@^1`, compiled into an inline SVG sprite at build time
- **Linting:** ESLint 10 (`eslint@^10`, `@eslint/js@^10`, `globals@^17`) and Stylelint 17 (`stylelint@^17`)
- **Formatting:** Prettier 3 (`prettier@^3`)
- **Runtime:** Node.js >= 22.12

## 🧠 Engineering Highlights

- **Build-time HTML partials** (`plugins/html-partials.js`): `<!-- @include header.html -->` inlines shared markup before Vite processes it, so asset URLs inside partials still get hashed. The plugin also reads `<body data-page="…">` and adds `aria-current="page"` to matching nav links, so the active state ships in the HTML with no JavaScript. Editing a partial reloads every open page in dev.
- **Inline icon sprite** (`plugins/icon-sprite.js`): the Lucide icons listed in `vite.config.js` and the custom SVGs in `src/assets/icons/` become `<symbol>` elements injected into each page. An unknown icon name fails the build instead of rendering an empty box.
- **Lazy component islands** (`core/registry.js`): `import.meta.glob` maps each file in `components/` to its `data-component` value. A page that has no carousel never downloads `carousel.js`.
- **One pooled IntersectionObserver** (`lib/observer.js`): observers are shared per `rootMargin`/`threshold` pair, so dozens of reveal targets use a single observer. The sticky-header shadow, reveal animations and carousel edge detection all go through it. There are no scroll listeners, and ESLint blocks `new IntersectionObserver` anywhere else.
- **No raw HTML injection** (`lib/dom.js`): DOM is built with a small hyperscript `h()`/`svg()` helper whose string children become text nodes. ESLint rejects `innerHTML`, `outerHTML` and `insertAdjacentHTML`, which removes the XSS surface for JSON-rendered content.
- **Design tokens enforced by lint**: every raw color and length lives in `src/styles/tokens.css`. Stylelint rejects hex, named and `rgb()`/`hsl()` colors elsewhere, raw px/rem/em spacing in `margin`, `padding`, `gap` and `scroll-*`, `!important` and ID selectors.
- **Strict 8px spacing grid and fluid type**: `--space-N` tokens are multiples of 8px. Fluid sizes interpolate linearly between the 375px and 1440px artboards with `clamp()`.
- **Cascade layers**: `tokens, reset, base, layout, components, pages, utilities`. Page stylesheets repeat the layer order first, so the cascade holds regardless of bundle order.
- **Accessibility built in**:
  - Native `<dialog>` with `showModal()`. A backdrop click closes it only when the press also started on the backdrop, so dragging a text selection out of a field doesn't dismiss the form.
  - The mobile menu makes `main` and the footer `inert`, locks scrolling, closes on Escape and returns focus to the toggle. It also closes automatically when the window grows to laptop width.
  - Carousel arrows use `aria-disabled` rather than `disabled`, so they stay focusable. Slides get `role="group"` and "N of M" labels.
  - Form errors are linked through `aria-describedby` and announced through a polite live region. Product loading progress goes to a small `#products-status` region, not the whole list.
  - Skip link, one `<h1>` per page, `role="list"` on unstyled lists, and a native checkbox fallback in forced-colors mode.
- **Motion that respects the user**: reduced motion sets the duration and distance tokens to about zero, which neutralizes every transition at once. `lib/motion.js` switches smooth scrolling to instant live, as the OS setting changes. Hidden "before reveal" states apply only under `@media screen and (scripting: enabled)`, so no-JS visitors and print always get the content. Above-the-fold content uses CSS-only `enter` animations that don't wait for JS.
- **Visible loading states**: skeletons are pre-rendered in `products/index.html`, so they appear before any JS runs without layout shift. Buttons show a spinner through `data-loading`. In dev, `VITE_SIMULATED_LATENCY` slows the services down so these states can be designed and tested.
- **Resilient fetching**: `services/products.js` and `services/order.js` use `AbortSignal.timeout()` (8s and 15s) and throw on non-2xx responses or a malformed body.
- **Cacheable assets**: `assetsInlineLimit: 0` emits every image as a hashed file instead of repeating data URIs in each page's HTML.

## 📁 Folder Structure

```
Tecnion/
├── index.html                  # Home: hero, services, about, capabilities, why-us, order CTA
├── about/index.html            # About the company, values, experience, development directions
├── pcb-assembly/index.html     # Assembly stages, technologies and standards
├── products/index.html         # Product case studies (renders products.json)
├── delivery/index.html         # Delivery methods, payment methods, terms
├── contacts/index.html         # Phone, email, address, map
├── legal/index.html            # Privacy and personal data policies
├── 404.html                    # Not-found page
├── vite.config.js              # Page registry, icon list, plugins
├── plugins/
│   ├── html-partials.js        # @include partials + aria-current nav state
│   ├── icon-sprite.js          # Builds the inline <symbol> sprite
│   └── paths.js                # Cross-platform path comparison for watchers
├── eslint.config.js            # JS rules (no raw HTML, no direct observers)
├── stylelint.config.js         # Token-only colors and 8px spacing rules
├── .prettierrc.json            # Prettier settings
├── .prettierignore             # Paths Prettier skips
├── .editorconfig               # Editor whitespace settings
├── .env.example                # Template for .env.local
├── .env.development            # Dev-only simulated latency
├── CLAUDE.md                   # Detailed architecture and conventions guide
├── package.json                # Scripts and dependencies
├── public/                     # Copied to dist/ as-is
│   ├── data/products.json      # Product case study data
│   ├── images/products/        # Product images (device-1..3.svg)
│   ├── files/                  # technion-proposal.pdf
│   ├── favicon.svg             # Site icon
│   └── robots.txt              # Crawler rules
└── src/
    ├── partials/               # head, header, logo, footer, order-dialog
    ├── assets/
    │   ├── icons/              # Custom sprite icons (logo-mark, flag-ru)
    │   └── images/             # SVG placeholder illustrations
    ├── styles/
    │   ├── main.css            # Layer order + global imports
    │   ├── tokens.css          # All design tokens (the only file with raw values)
    │   ├── base/               # reset, base, typography
    │   ├── layout/             # container, section, primitives
    │   ├── components/         # One BEM block per file
    │   ├── utilities/          # a11y, motion, feedback (spinner, skeleton)
    │   └── pages/              # One stylesheet per page
    └── scripts/
        ├── main.js             # Single entry: shell + reveal + islands
        ├── shell/              # site-header, site-nav, order-dialog, order-form
        ├── core/               # registry (lazy islands), reveal
        ├── components/         # carousel, product-list (lazy islands)
        ├── ui/                 # Pure DOM builders: icon, status, product-case, lists
        ├── lib/                # dom, observer, motion, latency
        └── services/           # products and order network calls
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 22.12 or newer** (required by Vite 8 and ESLint 10)
- **npm** (bundled with Node.js)
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/K01J10W19/Tecnion.git
```

```bash
cd Tecnion
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

To open a browser automatically:

```bash
npm run dev -- --open
```

### 4. Build for production

```bash
npm run build
```

The output goes to `dist/`.

### 5. Preview the production build

```bash
npm run preview
```

### Optional: connect the order form

Copy the example env file, then set `VITE_ORDER_ENDPOINT` in `.env.local` to a URL that accepts `multipart/form-data`:

```bash
cp .env.example .env.local
```

Leave it empty to keep the demo submit.

### Lint and format

```bash
npm run lint
```

```bash
npm run format
```

### Deploy

Upload `dist/` to any static host at the **domain root**. Links are root-absolute (`/about/`), and static hosts serve `404.html` for unknown URLs.

## 📱 Responsive Strategy

The CSS is mobile-first. Media queries use three `min-width` breakpoints (640px, 1024px and 1440px), and each component file holds its own overrides.

| Tier       | Width       | Container                | What changes                                                                                                                                                                        |
| ---------- | ----------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📱 Mobile  | < 640px     | Full width minus gutters | Stacked layout, sticky header with a menu panel, order dialog as a bottom sheet, swipeable scroll-snap rows, phone number hidden in the header, 48px controls                       |
| 📲 Tablet  | 640–1023px  | Full width minus gutters | Phone number shown in the header, carousel arrows appear, two-up grids and carousels, dialog becomes a centered modal, product case cards get a border and side-by-side brief cards |
| 💻 Laptop  | 1024–1439px | 960px                    | Inline nav replaces the menu toggle, "Made in Russia" badge shown, static header (overlaying the hero on Home), two-column hero, three-column services, 40px controls               |
| 🖥️ Monitor | >= 1440px   | 1040px                   | Wider container and a taller home hero                                                                                                                                              |

Between breakpoints, typography and section spacing scale fluidly with `clamp()` between the 375px and 1440px artboards. For example, `--space-gutter` grows from 16px to 32px and `--space-section` from 48px to 96px.

The site also adapts to user preferences:

- **`prefers-reduced-motion`** collapses motion tokens to near zero.
- **`hover: hover`** limits image zoom effects to devices with a real pointer.
- **`forced-colors`** falls back to the native checkbox.
- **`scripting: none`** shows no-JS content and hides JS-only controls.
