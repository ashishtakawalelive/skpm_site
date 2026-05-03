# SKPM & Associates LLP Website

## Project Overview

This repository contains a static marketing website for SKPM & Associates LLP, a chartered accountancy firm. The site is designed as a lightweight, content-driven HTML/CSS/JavaScript project with configuration-driven content injection.

The website is built without a backend framework or build system, making it easy to host as a static website on any web server or GitHub Pages.

## Technology Stack

- **HTML5**: The site is structured with plain HTML files.
- **CSS3**: Styling is managed in `style.css` with responsive layouts and component-based section styles.
- **JavaScript**: Client-side interactivity, content injection, route-aware asset resolution, and dynamic page rendering are handled by `script.js`, `services_config.js`, and `services_detail.js`.
- **Static asset delivery**: Images, logo files, and client logos are stored directly in the repository and referenced from HTML and JS.
- **No build step**: This repository uses no package manager, bundler, or preprocessing.

## Main Features

- Dynamic, configurable homepage content driven from central JavaScript configuration files.
- Global footer and contact section injection across pages.
- Responsive navigation with mobile menu toggle.
- Dynamic services listing on homepage, service list page, and service detail page.
- Centralized site configuration for hero content, contact details, industries, social links, and partner/team members.
- Static page structures for About, Careers, Services, and individual service pages.
- Clean repository layout that separates content, structure, styles, and scripts.

## Repository Structure

```
.
├── README.md
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
├── client_logos/
└── .git/
```

### Root Files

- `index.html`
  - The homepage of the site.
  - Contains the hero section, statistics, services preview, firm overview, and contact details.
  - Loads `config.js`, `services_config.js`, and `script.js` to populate content dynamically.

- `style.css`
  - Global styling for typography, layout, sections, grids, navigation, buttons, cards, and responsive behavior.
  - Supports both desktop and mobile presentations.

- `script.js`
  - Primary client-side script.
  - Handles mobile navigation toggling and navbar scroll styling.
  - Resolves asset paths correctly for nested page routes using `getRootPrefix()`.
  - Injects the global footer, business hours, contact details, and social links across pages.
  - Populates hero text, home services cards, and service list cards dynamically.

- `config.js`
  - Central site configuration object named `siteConfig`.
  - Contains hero text, brand quote, contact information, business hours, industries, social links, and team members.
  - Designed to be edited by non-developers to update content without touching page markup.

- `services_config.js`
  - Contains an array `servicesConfig` representing the firm’s service offerings.
  - Each entry includes service metadata such as `id`, `title`, `link`, `shortDesc`, `detailedDesc`, `expertise`, `icon`, `theme`, and `bgImage`.
  - Used by homepage and services listing pages.

- `services_detail.js`
  - Contains richer service detail metadata in a `servicesDetail` object.
  - Provides service-specific `keyFeatures`, `benefits`, `perfectFor`, and `whatYouGet` lists.
  - Supports service detail pages by injecting deeper content for each service.

### Pages Folder

The `pages/` directory contains nested content pages with specialized layouts for about, careers, and service-specific details.

- `pages/about/about.html`
  - About Us page markup.
  - Loads `about_config.js` for section text, story details, core values, and leadership bios.

- `pages/about/about_config.js`
  - Configuration for the About page.
  - Includes hero text, story sections, vision/mission/value cards, and leadership team details.

- `pages/careers/careers.html`
  - Careers page markup.
  - Contains the firm’s hiring and career-related content.

- `pages/services/services.html`
  - Services listing page with a full overview of offerings.
  - Uses `services_config.js` to render the complete service grid.

- `pages/services/service-detail.html`
  - Service detail page skeleton.
  - Likely reads from `services_detail.js` to populate content based on selected service.

- Individual service HTML files such as `audit.html`, `taxation.html`, `advisory.html`, etc.
  - Specific entry pages for each service offering.
  - They may load shared config and detail content.

## Content and Data Flow

1. `index.html` loads `config.js` and `services_config.js` in the `<head>`.
2. `script.js` executes after DOM content loads and uses the shared configuration objects.
3. The script resolves relative paths for nested pages, ensuring that assets and links work from both root and `pages/` subfolders.
4. Home page cards, footer content, contact sections, and hero text are generated dynamically from JS config.
5. Service page navigation preserves selected service state using `sessionStorage`.

## How to Edit Content

- Change the hero title, subtitle, and brand quote in `config.js`.
- Update contact details, business hours, or social links in `config.js`.
- Edit the list of services in `services_config.js` to add, modify, or remove offerings.
- Adjust the About page narrative and leadership details in `pages/about/about_config.js`.
- Replace images by adding files to `images/`, `logo/`, or `client_logos/`, then update references in config files.

## Deployment Notes

- Since this is a static site, simply upload the repository contents to a static host such as GitHub Pages, Netlify, Vercel, or any static web server.
- Ensure that the `pages/` directory remains intact so nested route links and asset resolution continue to work.
- If hosting under a subpath, verify that relative paths in `script.js` and HTML links are still correct.

## Useful Details for AI or Tooling

- This repository does not use Node, npm, or any build pipeline.
- Content is defined in JavaScript objects and injected at runtime.
- The page logic is based on DOM manipulation and CSS classes rather than a frontend framework.
- Editing configuration files updates content globally without needing to modify HTML templates.

## Summary

This project is a structured static website that separates design, markup, and content via configuration-driven JavaScript files. It is ideal for fast deployment and simple maintenance, and the `README.md` now documents both the technology choices and the full repository structure.
"# skpm_site" 
