# SKPM & Associates LLP Website Project Overview

## Purpose

This file documents the static website implementation for SKPM & Associates LLP. It is written to help developers, AI tools, and maintainers quickly understand the project architecture, feature set, content flow, and how the code is organized.

## Technology Stack

- **HTML5**: Static markup for all pages.
- **CSS3**: Styling provided by `style.css` for layout, typography, responsive behavior, and visual components.
- **JavaScript**: Client-side scripts in `script.js`, `services_config.js`, and `services_detail.js` manage dynamic content population, page behavior, and service data.
- **Static assets**: Images and logos are stored in `images/`, `logo/`, and `client_logos/`.
- **No backend**: This is a fully static front-end site with no server-side rendering or build toolchain.

## Key Features

- Central content configuration through JavaScript objects.
- Home page content injected at runtime from `config.js` and `services_config.js`.
- Responsive mobile navigation and navbar scroll effects.
- Shared footer generation across pages.
- Service listings and card generation based on service configuration.
- Service selection state persisted with `sessionStorage`.
- Separate content configuration for the About page.

## Repository Structure

```
.
├── README.md
├── PROJECT_OVERVIEW.md
├── index.html
├── style.css
├── script.js
├── config.js
├── services_config.js
├── services_detail.js
├── logo/
├── images/
├── client_logos/
├── pages/
│   ├── about/
│   │   ├── about.html
│   │   └── about_config.js
│   ├── careers/
│   │   └── careers.html
│   └── services/
│       ├── advisory.html
│       ├── audit.html
│       ├── cfo.html
│       ├── governance.html
│       ├── indas.html
│       ├── nri.html
│       ├── rera.html
│       ├── service-detail.html
│       ├── services.html
│       ├── succession.html
│       ├── taxation.html
│       └── valuation.html
├── download_images.ps1
├── update_fonts.ps1
├── replace_footers.py
└── update_footers.py
```

## Root Files Explained

- `index.html`
  - Homepage of the site.
  - Contains sections for hero, statistics, services preview, about summary, and contact.
  - Loads configuration files to render dynamic content.

- `style.css`
  - Defines layout, typography, grids, buttons, cards, responsive breakpoints, and visual styling.

- `script.js`
  - Core client-side behavior.
  - Handles mobile menu toggling and navbar style on scroll.
  - Resolves nested asset paths for pages inside `pages/`.
  - Injects footer, service cards, contact details, and dynamic text.

- `config.js`
  - Global site configuration object.
  - Contains hero text, brand quote, contact info, industries list, social links, and team member data.
  - Designed for content updates without changing page structure.

- `services_config.js`
  - Service catalog configuration.
  - Each service includes ID, title, page link, descriptions, expertise list, icon, theme, and background image.
  - Used to render service cards and links across the site.

- `services_detail.js`
  - Additional service detail metadata.
  - Provides lists of key features, benefits, target audiences, and deliverables for service detail pages.

## Pages and Content Flow

- `pages/about/about.html`
  - About Us page content.
  - Loads `about_config.js` to display mission, vision, core values, and leadership profiles.

- `pages/about/about_config.js`
  - About page content data object.
  - Contains hero text, story sections, value cards, core values, and leadership team details.

- `pages/careers/careers.html`
  - Careers page layout and messaging for recruitment.

- `pages/services/services.html`
  - Services listing page.
  - Displays the full service catalog using `services_config.js`.

- `pages/services/service-detail.html`
  - Service detail page skeleton.
  - Displays selected service information using JS data.

- `pages/services/*.html`
  - Individual service landing pages for audit, taxation, advisory, NRI, governance, valuation, Ind AS, CFO, succession planning, and RERA.

## Dynamic Behavior Summary

- `script.js` uses DOMContentLoaded to wait for page build.
- `getRootPrefix()` computes correct base paths so nested pages can load assets from the root.
- The footer is injected into pages dynamically using a placeholder element.
- The home page's service cards are generated from `services_config.js`, ensuring the service catalog is centralized.
- When a service card is clicked, `sessionStorage.setItem('selectedService', service.id)` preserves which service was selected.

## How to Understand the Project

A coding AI can understand this project quickly by reading these key patterns:

1. `config.js` and `services_config.js` are content sources.
2. `script.js` is the runtime DOM manipulator.
3. HTML files are static templates with placeholders for generated content.
4. Images and assets are referenced through relative paths resolved in JS.
5. The site is static and requires only a web server or file hosting.

## Common Task Patterns

### Adding a New Service

To add a new service offering to the site, follow these steps in order:

1. **Add entry to `services_config.js`**: Create a new object in the `servicesConfig` array with properties:
   - `id`: Unique identifier (e.g., "succession")
   - `title`: Service name (e.g., "Succession Planning")
   - `link`: HTML filename (e.g., "succession.html")
   - `shortDesc`: One-line description for card display
   - `detailedDesc`: Multi-sentence description for detail pages
   - `expertise`: Array of expertise areas
   - `icon`: Inline SVG string or reference
   - `theme`: Color theme name (e.g., "blue", "amber", "emerald")
   - `bgImage`: Path to background image

2. **Create the service HTML file**: Add a new file in `pages/services/` named to match the `link` property (e.g., `succession.html`).
   - Follow the structure of existing files like `audit.html` or `advisory.html`.
   - Ensure the file loads config files and `script.js`.

3. **Add detail metadata to `services_detail.js`**: Add a matching object in the `servicesDetail.services` array with:
   - `name`: Matching the service title
   - `keyFeatures`: Array of core features
   - `benefits`: Array of client benefits
   - `perfectFor`: Target audience array
   - `whatYouGet`: Deliverables array

4. **Test the service card rendering** on both homepage and services listing page to ensure the card displays and links correctly.

### Updating Contact Information

1. Edit the `contactInfo` object in `config.js` with new phone, email, address, or business hours.
2. The footer injection logic in `script.js` automatically pulls these values and updates all pages.
3. No HTML changes needed; changes are reflected globally on next page load.

### Modifying Hero Section Text

1. Update `siteConfig.heroSettings` in `config.js` with new `titleLine1`, `titleLine2`, or `subtitle`.
2. The typing animation in `script.js` reads from these config values.
3. Changes appear immediately on the homepage.

### Adding a New Team Member

1. Add a new entry to `siteConfig.teamMembers` in `config.js` with name, qualifications, image path, and social links.
2. The team grid in `script.js` renders all team members dynamically.
3. Image should be added to `images/` folder and referenced with relative path.

## script.js Function Map

The following are the key functions and their responsibilities:

### Path Resolution Functions
- **`isNestedPagePath()`**: Detects if the current page is inside the `pages/` folder by checking the pathname.
- **`getRootPrefix()`**: Returns `'../../'` for nested pages, `''` for root pages. Essential for correct asset path resolution.
- **`getServicesPrefix()`**: Returns correct prefix for service links (`''` for nested pages, `'pages/services/'` for root).
- **`getAboutPagePath()`**: Returns correct path to the About page, accounting for nested routing.
- **`resolveAssetPath(assetPath)`**: Prepends `getRootPrefix()` to relative asset paths; handles absolute URLs and data URIs without modification.

### DOM Manipulation Functions (all run on `DOMContentLoaded`)
- **Navbar Scroll Effect**: Adds `navbar-scrolled` class when scroll position exceeds 50px, triggering CSS-based styling.
- **Mobile Menu Toggle**: Listens for clicks on `mobile-menu-btn`, toggles `active` class on nav-links, and adds `menu-open` class to body for mobile styling.
- **Footer Injection**: Replaces the `footer-placeholder` element with a fully rendered footer containing contact info, links, and social icons.
- **Home Services Grid Rendering** (`homeServicesGrid`): Generates clickable service cards from `servicesConfig` with hover effects and theme-based icons.
- **Full Services List** (`fullServicesGrid`): Renders a numbered grid of all services with icon, title, short description, and explore link.
- **Team Grid Rendering**: Populates `team-grid` with team member cards including images and social links.
- **Industries Honeycomb** (`industriesGrid`): Renders a responsive hexagon-based grid of industries with images and animations.

### Animation Functions
- **Counter Animation**: Observes `.stat-number` elements and animates count-up from 0 to target value using `requestAnimationFrame` with easing.
- **Section Scroll Animations**: Uses `IntersectionObserver` to detect when sections (brand quote, services, about firm, etc.) enter viewport and adds `in-view` class to trigger CSS animations.
- **Typing Animation** (`titleContainer`): Simulates a typewriter effect for the hero title, typing each line sequentially with a blinking cursor.

### State Management
- **Service Selection**: `sessionStorage.setItem('selectedService', service.id)` stores the selected service ID when a service card is clicked, allowing detail pages to load the correct content.

## Known Gotchas and Constraints

- **Asset paths in nested pages must use `getRootPrefix()`**: If a page inside `pages/` tries to reference an asset without the correct prefix, images and resources will break. All `img src` attributes should use `resolveAssetPath()` or manually prepend the prefix.

- **Footer placeholder element must exist**: If the `footer-placeholder` element (id) is missing from an HTML page, the global footer will not render. Check that all pages include this placeholder.

- **Service configuration is centralized**: The homepage services grid, full services list, and service detail rendering all depend on consistent data in `services_config.js`. If you add a service to the config but forget to create the HTML page, the link will break.

- **Mobile menu closing logic depends on document.querySelectorAll('a')**: All anchor tags on the page will trigger mobile menu closure when clicked. Be careful if adding new click handlers to links without proper event delegation.

- **sessionStorage is cleared on browser close**: Service selection persists only within the same browser session. Refreshing a service detail page after the browser closes will not remember the previous selection.

- **CSS animation delays are randomized**: Industries honeycomb tiles have random animation delays. For predictable behavior in testing, this may need to be disabled.

- **Intersection Observer threshold values vary by section**: Different sections use different threshold values (0.15, 0.2, 0.22) for triggering animations. If scroll animations don't trigger as expected, check the threshold in the observer configuration.

## CSS Class Naming Conventions

This project uses a custom naming convention blending BEM (Block Element Modifier) and utility classes:

- **Block classes** (main containers): `.container`, `.navbar`, `.footer`, `.hero-blur-bg`, `.section-padding`
- **Component classes** (reusable cards/elements): `.service-card`, `.team-card`, `.stat-item`, `.hover-img-card`, `.about-feature-card`
- **Theme modifier classes**: `.theme-blue`, `.theme-teal`, `.theme-green`, `.theme-orange`, `.theme-purple`, `.theme-red`, `.theme-indigo`, `.theme-cyan`, `.theme-amber`, `.theme-emerald`
- **State classes** (applied by JS): `.active`, `.navbar-scrolled`, `.menu-open`, `.in-view`
- **Responsive grid classes**: `.stats-grid`, `.colorful-cards-grid`, `.hover-cards-grid`, `.footer-grid-clean`, `.service-link-wrapper`, `.contact-grid`
- **Utility classes** (typography/spacing): `.global-heading`, `.global-body`, `.text-center`, `.section-padding`, `.container`
- **Animation/effect classes**: `.typing-cursor`, `.blink`, `.fade-in`, `.slide-in`

When adding new elements, follow this pattern: use descriptive block names and avoid deep nesting. Use theme classes for color variations rather than hard-coded colors.

## Service HTML Page Structure

All individual service HTML pages (e.g., `audit.html`, `taxation.html`, `advisory.html`) follow a consistent template structure:

1. **DOCTYPE and Head**: Standard HTML5 head with `<meta charset>`, `<meta viewport>`, title, and link to `style.css`.
2. **Config Script Tags**: Both service pages load `config.js` and `services_config.js` in the `<head>` for global configuration access.
3. **Navigation Bar**: Static navbar with logo, links, and mobile menu toggle (identical to homepage).
4. **Service Detail Section**: Main content area displaying service information pulled from `services_detail.js` and rendered by JavaScript.
5. **Contact/CTA Section**: Call-to-action section encouraging users to contact the firm.
6. **Footer Placeholder**: `<div id="footer-placeholder"></div>` replaced dynamically by `script.js`.
7. **Script Tags**: Loads `script.js` for dynamic behavior and asset path resolution.

All pages are static HTML with no backend. Content for service details is injected at runtime from JavaScript configuration objects.

## Contact Form Behavior

The contact form on the homepage (id: `contact-form`) is a static HTML form with the following behavior:

- **Form Action**: Submits to a Google Apps Script endpoint: `https://script.google.com/macros/s/AKfycbxhhuQDkzdh_wme057uVBRUrQtSqVjFOqgRuLHvm3yBdMdvn-yzPraYYtAZ_hUPFFeo/exec`
- **Method**: POST
- **Form Fields**:
  - Full Name (text, required)
  - Email Address (email, required)
  - Phone Number (tel, required, min 10 digits)
  - Message (textarea, required)
- **Backend Behavior**: The Google Apps Script endpoint receives the form data and handles it (likely sending an email or storing in a spreadsheet). This is a third-party service, not managed within this repository.
- **Success/Error Handling**: The form includes a `#form-message` div that displays feedback. Client-side validation ensures required fields are filled before submission.
- **Response Time**: The page tooltip indicates the team will respond within 24 hours.

Note: The form does not have custom JavaScript submission handlers in this codebase; it relies on the default HTML form submission behavior. Any response handling (success message display) would be managed by the Google Apps Script endpoint or require additional JS implementation.

## Browser and Environment Targets

- **Modern browsers**: Chrome, Firefox, Safari, Edge (all modern versions within 2 years).
- **No IE support**: Internet Explorer is not supported. This codebase uses CSS Grid, Flexbox, CSS Variables, and ES6 JavaScript features.
- **Mobile support**: Responsive design with breakpoints for mobile (<480px), tablet (<768px), and desktop.
- **CSS features used**: CSS Grid, Flexbox, CSS Variables (custom properties), backdrop-filter (glassmorphism), CSS animations, and Intersection Observer API.
- **JavaScript API usage**: `fetch()`, `IntersectionObserver`, `requestAnimationFrame`, `sessionStorage`, `classList` API, `querySelector/querySelectorAll`, modern event handling.
- **No polyfills**: This codebase assumes a modern JavaScript environment and does not include polyfills for older browsers.

If deploying to environments requiring older browser support, consider adding polyfills for `IntersectionObserver` and CSS fallbacks for Grid/Flexbox.

## Maintenance Notes

- To update copy or contact details, edit `config.js` or `pages/about/about_config.js`.
- To add or change services, update `services_config.js` and add the matching HTML page in `pages/services/`.
- When adding images, place them in `images/`, `logo/`, or `client_logos/` and update the config references.
- Service selection state is temporary and stored in `sessionStorage`. For persistent user preferences, a backend would be needed.
- The contact form endpoint (Google Apps Script) should be tested after any deployment to ensure submissions are received.

## Hosting Notes

- This repo can be served as a static site without additional build tools.
- It is compatible with GitHub Pages, Netlify, Vercel, or any static hosting provider.
- Ensure the full `pages/` folder is published so nested links continue to resolve correctly.
- If hosting under a subpath (e.g., `example.com/skpm/`), verify that relative paths in `script.js` and HTML links still resolve. The `getRootPrefix()` logic may need adjustment.
