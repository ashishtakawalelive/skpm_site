function isNestedPagePath() {
    return window.location.pathname.includes('/pages/');
}

function getRootPrefix() {
    return isNestedPagePath() ? '../../' : '';
}

function getServicesPrefix() {
    return isNestedPagePath() ? '' : 'pages/services/';
}

function getAboutPagePath() {
    return isNestedPagePath() ? '../about/about.html' : 'pages/about/about.html';
}

function resolveAssetPath(assetPath) {
    if (!assetPath) return assetPath;
    if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith('data:')) return assetPath;
    if (assetPath.startsWith('../') || assetPath.startsWith('./') || assetPath.startsWith('/')) return assetPath;
    return `${getRootPrefix()}${assetPath}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const rootPrefix = getRootPrefix();
    const servicesPrefix = getServicesPrefix();
    const aboutPagePath = getAboutPagePath();

    // ---------------------------------------------------------
    // 0. Navbar Scroll Effect
    // ---------------------------------------------------------
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.add('active');
            document.body.classList.add('menu-open');
        });

        const closeBtn = document.getElementById('mobile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }

        // Close menu and clear state when any link (including logo) is clicked
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Safeguard: Ensure menu is closed on fresh load
    document.body.classList.remove('menu-open');
    if (navLinks) navLinks.classList.remove('active');

    // ---------------------------------------------------------
    // 1. Inject Config Data into DOM
    // ---------------------------------------------------------
    if (typeof siteConfig !== 'undefined') {
        // Populate Hero Settings
        const heroSubtitle = document.getElementById("hero-subtitle");
        if (heroSubtitle && siteConfig.heroSettings && siteConfig.heroSettings.subtitle) {
            heroSubtitle.textContent = siteConfig.heroSettings.subtitle;
        }

        // Populate Brand Quote
        const brandQuote = document.getElementById("brand-quote-text");
        if (brandQuote && siteConfig.heroSettings) {
            const l1 = siteConfig.heroSettings.brandQuoteLine1 || '';
            const l2 = siteConfig.heroSettings.brandQuoteLine2 || '';
            const lastSpace = l2.lastIndexOf(' ');
            const l2a = lastSpace >= 0 ? l2.slice(0, lastSpace) : l2;
            const l2b = lastSpace >= 0 ? l2.slice(lastSpace + 1) : '';
            brandQuote.innerHTML = `<span class="bq-line1">${l1}</span><br><span class="bq-line2">${l2a}</span><div class="bq-red-line"></div><span class="bq-line2 bq-line2b">${l2b}</span>`;
        }

        // ── SHARED FOOTER INJECTION ──────────────────────────────
        const businessHoursContainer = document.getElementById("business-hours-container");
        if (businessHoursContainer && siteConfig.contactInfo && siteConfig.contactInfo.businessHours) {
            const hours = siteConfig.contactInfo.businessHours;
            businessHoursContainer.innerHTML = `
                <div class="business-hours-card">
                    <h4>Business Hours</h4>
                    <p>Monday - Friday: ${hours.mondayToFriday || ''}</p>
                    <p>Saturday: ${hours.saturday || ''}</p>
                    <p>Sunday: ${hours.sunday || ''}</p>
                </div>
            `;
        }

        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            // Build LinkedIn icon
            let socialHtml = '';
            if (siteConfig.socialLinks && siteConfig.socialLinks.linkedin) {
                socialHtml = `<a href="${siteConfig.socialLinks.linkedin}" target="_blank" aria-label="LinkedIn"
                    style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:transparent;border-radius:8px;transition:all 0.3s ease;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.342-4-3.085-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>`;
            }

            // Build contact info
            const c = siteConfig.contactInfo || {};
            const contactHtml = `
                <li><strong>Address:</strong> ${c.address || ''}</li>
                <li><strong>Phone:</strong> ${c.phone || ''}</li>
                <li><strong>Landline:</strong> ${c.landline || ''}</li>
                <li><strong>Email:</strong> ${c.email || ''}</li>
                ${c.mapUrl ? `<li style="margin-top:1rem;">
                    <a href="${c.mapUrl}" target="_blank" title="Open in Google Maps"
                       style="display:inline-flex;align-items:center;gap:0.6rem;color:#38BDF8;font-weight:500;font-size:0.95rem;">
                       <img src="${resolveAssetPath('images/maps.png')}" alt="Google Maps" style="width:28px;height:28px;object-fit:contain;"> Google Maps
                    </a>
                </li>` : ''}
            `;

            // Inject scroll-to-top button globally
            const scrollBtnStyle = document.createElement('style');
            scrollBtnStyle.textContent = `
                #scroll-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 48px;
                    height: 48px;
                    background: #ffffff;
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(12px);
                    transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease, box-shadow 0.2s ease;
                    z-index: 9999;
                }
                #scroll-to-top.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                #scroll-to-top:hover {
                    box-shadow: 0 8px 28px rgba(37,99,235,0.25);
                    transform: translateY(-2px);
                }
                #scroll-to-top svg {
                    width: 22px;
                    height: 22px;
                    stroke: #38BDF8;
                    stroke-width: 2.5;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
            `;
            document.head.appendChild(scrollBtnStyle);

            const scrollBtn = document.createElement('button');
            scrollBtn.id = 'scroll-to-top';
            scrollBtn.setAttribute('aria-label', 'Scroll to top');
            scrollBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`;
            document.body.appendChild(scrollBtn);

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
            }, { passive: true });

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            footerPlaceholder.outerHTML = `
            <footer id="contact" class="footer">
                <div class="container footer-grid-clean">
                    <div class="footer-col">
                        <img src="${resolveAssetPath('logo/s-k-p-m-associates-llp-chartered-accountants-1.png')}" alt="SKPM logo" class="footer-logo">
                        <p class="footer-tagline">Your trusted partner for financial, taxation, and corporate governance solutions globally.</p>
                        <div class="social-links dark-socials" style="margin-top:1.5rem;">${socialHtml}</div>
                    </div>
                    <div class="footer-col">
                        <h4>Quick Links</h4>
                        <ul style="list-style:none;padding:0;">
                            <li><a href="${rootPrefix}index.html#home">Home</a></li>
                            <li><a href="${aboutPagePath}">About Firm</a></li>
                            <li><a href="${rootPrefix}index.html#industries">Industries We Cater</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Useful Links</h4>
                        <ul style="list-style:none;padding:0;">
                            <li><a href="https://www.incometaxindia.gov.in/" target="_blank">Income Tax Dept.</a></li>
                            <li><a href="https://www.gst.gov.in/" target="_blank">Goods & Services Tax</a></li>
                            <li><a href="https://www.mca.gov.in/content/mca/global/en/home.html" target="_blank">Ministry of Corporate Affairs</a></li>
                            <li><a href="https://www.rbi.org.in/" target="_blank">Reserve Bank of India</a></li>
                            <li><a href="https://www.cbic.gov.in/" target="_blank">Central Board of Excise and Custom</a></li>
                        </ul>
                    </div>
                    <div class="footer-col contact-col">
                        <h4>Contact Us</h4>
                        <ul style="list-style:none;padding:0;">${contactHtml}</ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 SKPM &amp; Associates LLP. All rights reserved.</p>
                </div>
            </footer>`;
        } else {
            // Legacy fallback: populate individual elements if footer already in HTML
            const footerContact = document.getElementById("footer-contact-info");
            if (footerContact && siteConfig.contactInfo) {
                const c = siteConfig.contactInfo;
                footerContact.innerHTML = `
                    <li><strong>Address:</strong> ${c.address}</li>
                    <li><strong>Phone:</strong> ${c.phone}</li>
                    <li><strong>Email:</strong> ${c.email}</li>
                    ${c.mapUrl ? `<li style="margin-top:1rem;"><a href="${c.mapUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:0.6rem;color:#38BDF8;font-weight:500;font-size:0.95rem;"><img src="${resolveAssetPath('images/maps.png')}" alt="Google Maps" style="width:28px;height:28px;object-fit:contain;"> Google Maps</a></li>` : ''}
                `;
            }
            const socialLinksContainer = document.getElementById("footer-social-links");
            if (socialLinksContainer && siteConfig.socialLinks && siteConfig.socialLinks.linkedin) {
                socialLinksContainer.innerHTML = `<a href="${siteConfig.socialLinks.linkedin}" target="_blank" aria-label="LinkedIn" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:transparent;border-radius:8px;transition:all 0.3s ease;"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.342-4-3.085-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>`;
            }
        }
        // ── END SHARED FOOTER ────────────────────────────────────


        // New Feature: Interactive Hover-Image Cards for Services
        const homeServicesGrid = document.getElementById("home-services-grid");
        if (homeServicesGrid) {
            homeServicesGrid.className = 'hover-cards-grid';
            homeServicesGrid.innerHTML = ''; // Clear placeholders
            
            const servicesToRender = typeof servicesConfig !== 'undefined' ? servicesConfig : (siteConfig.services || []);
            servicesToRender.forEach((service) => {
                const card = document.createElement("a");
                card.href = `${servicesPrefix}${service.link || 'service-detail.html'}`;
                card.className = `hover-img-card theme-${service.theme || 'blue'}`;
                
                // Persistence fix: Store selected service in session storage to avoid URL param stripping issues
                card.onclick = () => {
                   sessionStorage.setItem('selectedService', service.id);
                };
                
                const imgUrl = resolveAssetPath(service.bgImage) || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80";

                // Map service themes to professional SVG icons
                const svgIcons = {
                    blue: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
                    teal: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
                    green: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
                    orange: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
                    purple: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
                    red: '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
                    indigo: '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
                    cyan: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
                    amber: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
                    emerald: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
                };
                const iconSvg = svgIcons[service.theme] || svgIcons.blue;

                card.innerHTML = `
                    <div class="hover-bg-wrapper">
                        <div class="hover-bg-image" style="background-image: url('${imgUrl}');"></div>
                        <div class="hover-bg-overlay"></div>
                    </div>
                    <div class="hover-card-content">
                        <div class="card-icon-circle">
                            ${iconSvg}
                        </div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A;">${service.title}</h3>
                    </div>
                `;
                homeServicesGrid.appendChild(card);
            });
        }

        const fullServicesGrid = document.getElementById("full-services-list");
        if (fullServicesGrid) {
            fullServicesGrid.innerHTML = '';
            const servicesToRender = typeof servicesConfig !== 'undefined' ? servicesConfig : (siteConfig.services || []);
            servicesToRender.forEach((service, index) => {
                const card = document.createElement("a");
                card.href = `${servicesPrefix}${service.link || 'service-detail.html'}`;
                card.className = `sf-card theme-${service.theme} service-link-wrapper`;
                
                card.onclick = () => {
                    sessionStorage.setItem('selectedService', service.id);
                 };
                
                const displayNo = (index + 1).toString().padStart(2, '0');

                card.innerHTML = `
                    <div class="sf-number">${displayNo}</div>
                    <div class="sf-icon-box">
                        ${service.icon}
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.shortDesc}</p>
                    <div class="explore-link">
                        Explore Service 
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                `;
                fullServicesGrid.appendChild(card);
            });
        }

        // Populate Team Section
        const teamGrid = document.getElementById("team-grid");
        if (teamGrid) {
            siteConfig.teamMembers.forEach(member => {
                const memberCard = document.createElement("div");
                memberCard.className = "team-card";
                
                let socialHtml = '<div class="member-socials">';
                if (member.linkedin) {
                    socialHtml += `
                        <a href="${member.linkedin}" target="_blank" class="member-social-btn linkedin" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>`;
                }
                if (member.instagram) {
                    socialHtml += `
                        <a href="${member.instagram}" target="_blank" class="member-social-btn instagram" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>`;
                }
                socialHtml += '</div>';

                memberCard.innerHTML = `
                    <div class="team-img-wrapper">
                        <img src="${resolveAssetPath(member.imagePath)}" alt="${member.name}">
                    </div>
                    <div class="team-info">
                        <h3>${member.name}</h3>
                        <p class="designation">${member.qualifications}</p>
                        ${socialHtml}
                    </div>
                `;
                teamGrid.appendChild(memberCard);
            });
        }

        // 2b. Dynamic Industries Honeycomb Rendering
        const industriesGrid = document.getElementById("industries-grid");
        if (industriesGrid && siteConfig.industries) {
            // Use fewer tiles per row on smaller screens so the honeycomb never overflows horizontally.
            const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            const isVeryMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 480px)').matches;

            // Mobile: pairs of 2, with last odd one alone. Desktop: honeycomb pattern.
            let pattern;
            if (isMobile) {
                const total = siteConfig.industries.length;
                pattern = [];
                for (let i = 0; i < total; i += 2) {
                    pattern.push(Math.min(2, total - i));
                }
            } else {
                pattern = [4, 7, 4];
            }
            let industryIdx = 0;

            pattern.forEach((count) => {
                const row = document.createElement("div");
                row.className = "honey-row";

                for (let i = 0; i < count; i++) {
                    if (industryIdx < siteConfig.industries.length) {
                        const ind = siteConfig.industries[industryIdx];
                        const cell = document.createElement("div");
                        cell.className = "hex-cell";
                        const randomDelay = (Math.random() * 3.5).toFixed(2);
                        cell.style.animationDelay = `-${randomDelay}s`;
                        cell.innerHTML = `
                            <img src="${resolveAssetPath(ind.img)}" class="hex-img" alt="${ind.name}">
                            <div class="hex-overlay"></div>
                            <div class="hex-content">
                                <h4 style="font-size: 1.6rem; margin-bottom: 3px;">${ind.emoji}</h4>
                                <h4 style="font-size: 0.9rem; margin: 0; line-height: 1.2;">${ind.name}</h4>
                            </div>
                        `;
                        row.appendChild(cell);
                        industryIdx++;
                    }
                }
                industriesGrid.appendChild(row);
            });
        }
    }

    // ---------------------------------------------------------
    // 3. Counter Animation (Fixed for smooth small increments)
    // ---------------------------------------------------------
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length > 0) {
        const animationDuration = 2000; // 2 seconds
        
        const startCounters = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    let startTime = null;

                    const updateCount = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / animationDuration, 1);
                        
                        const easeOutProb = 1 - Math.pow(1 - progress, 3);
                        const currentVal = Math.floor(easeOutProb * target);

                        counter.innerText = currentVal;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    
                    requestAnimationFrame(updateCount);
                    observer.unobserve(counter);
                }
            });
        };

        const options = { root: null, threshold: 0.5, rootMargin: "0px" };
        const observer = new IntersectionObserver(startCounters, options);
        counters.forEach(counter => observer.observe(counter));
    }

    // ---------------------------------------------------------
    // 3b. Brand Quote Scroll Animation
    // ---------------------------------------------------------
    const brandQuoteSection = document.querySelector('.brand-quote-section');
    if (brandQuoteSection) {
        const quoteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    quoteObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        quoteObserver.observe(brandQuoteSection);
    }

    const servicesGrid = document.querySelector('.colorful-cards-grid');
    if (servicesGrid) {
        const servicesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    servicesObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        servicesObserver.observe(servicesGrid);
    }

    const homeServicesCardGrid = document.querySelector('.hover-cards-grid');
    if (homeServicesCardGrid) {
        const waterfallObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                waterfallObserver.unobserve(entry.target);
                const cards = Array.from(entry.target.querySelectorAll('.hover-img-card'));

                // Reset to hidden with no transition so the browser registers starting state
                cards.forEach(card => {
                    card.style.transition = 'none';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-140px)';
                });

                // Double rAF: ensures browser paints the reset before animating
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        cards.forEach((card, i) => {
                            const col = i % 5;
                            const row = Math.floor(i / 5);
                            const delay = col * 160 + row * 80;
                            card.style.transition = `transform 0.9s ${delay}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ${delay}ms ease`;
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        });

                        // Clear only the inline transition after animation so CSS hover transitions take over.
                        // Keep opacity/transform inline so cards stay visible (CSS base is opacity:0).
                        const maxDelay = 4 * 160 + 1 * 80 + 900; // 1620ms
                        setTimeout(() => {
                            cards.forEach(card => {
                                card.style.transition = '';
                            });
                        }, maxDelay + 50);
                    });
                });
            });
        }, { threshold: 0.15 });
        waterfallObserver.observe(homeServicesCardGrid);
    }

    const aboutFirmSection = document.querySelector('.about-firm-section');
    if (aboutFirmSection) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.22 });
        aboutObserver.observe(aboutFirmSection);
    }

    const approachSection = document.querySelector('.why-choose-us-section');
    if (approachSection) {
        const approachObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    approachObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        approachObserver.observe(approachSection);
    }

    // ---------------------------------------------------------
    // 4. Infinite Typing Animation (Robust method)
    // ---------------------------------------------------------
    const titleContainer = document.getElementById('typing-title');
    if (titleContainer) {
        const line1 = (siteConfig && siteConfig.heroSettings) ? siteConfig.heroSettings.titleLine1 : "Your Finances";
        const line2 = (siteConfig && siteConfig.heroSettings) ? siteConfig.heroSettings.titleLine2 : "Our Expertise";
        
        function runTypingLoop() {
            titleContainer.innerHTML = ''; 
            titleContainer.style.opacity = '1';
            
            const span1 = document.createElement('span');
            const br = document.createElement('br');
            const span2 = document.createElement('span');
            span2.className = 'highlight'; // This class adds styling
            span2.style.color = '#38BDF8'; // Force the new Blue brand color
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.innerHTML = '|';
            
            titleContainer.appendChild(span1);
            titleContainer.appendChild(cursor); 

            let charIndex1 = 0;
            let charIndex2 = 0;

            function typeLine1() {
                if (charIndex1 < line1.length) {
                    span1.textContent += line1.charAt(charIndex1);
                    charIndex1++;
                    setTimeout(typeLine1, 100);
                } else {
                    setTimeout(() => {
                        titleContainer.insertBefore(br, cursor);
                        titleContainer.insertBefore(span2, cursor);
                        typeLine2();
                    }, 300);
                }
            }

            function typeLine2() {
                if (charIndex2 < line2.length) {
                    span2.textContent += line2.charAt(charIndex2);
                    charIndex2++;
                    setTimeout(typeLine2, 100);
                } else {
                    cursor.classList.add('blink');
                    setTimeout(eraseBothLines, 4000); // Read time
                }
            }

            function eraseBothLines() {
                cursor.classList.remove('blink');
                
                function eraseLine2() {
                    if (charIndex2 > 0) {
                        span2.textContent = line2.substring(0, charIndex2 - 1);
                        charIndex2--;
                        setTimeout(eraseLine2, 30); // Faster erase
                    } else {
                        span2.remove();
                        br.remove();
                        eraseLine1();
                    }
                }

                function eraseLine1() {
                    if (charIndex1 > 0) {
                        span1.textContent = line1.substring(0, charIndex1 - 1);
                        charIndex1--;
                        setTimeout(eraseLine1, 30);
                    } else {
                        setTimeout(runTypingLoop, 500); // Restart
                    }
                }
                
                eraseLine2();
            }
            
            setTimeout(typeLine1, 500);
        }
        
        runTypingLoop();
    }
});
/**
 * Dynamic Service Detail Page Rendering (Figma Premium Version)
 */
function renderServiceDetail() {
    const root = document.getElementById('service-detail-root');
    if (!root) return;
    const rootPrefix = getRootPrefix();
    const servicesPrefix = getServicesPrefix();

    const urlParams = new URLSearchParams(window.location.search);
    // Robust fallback: Check URL param first, then check sessionStorage (in case URL is stripped)
    const serviceId = urlParams.get('service') || sessionStorage.getItem('selectedService') || 'audit';
    
    // Direct robust mapping to match services_detail.js
    const contentMap = {
        'audit': 'Auditing & Assurance',
        'tax': 'Taxation Compliance & Litigation',
        'advisory': 'Financial Advisory',
        'nri': 'NRI Compliance & Advisory',
        'governance': 'Corporate Governance Services',
        'valuation': 'Valuation',
        'indas': 'Ind AS Implementation & Compliance',
        'cfo': 'Virtual CFO & Business Transformation Advisory',
        'succession': 'Succession Planning',
        'rera': 'RERA Registration & Compliance'
    };

    const targetName = contentMap[serviceId] || 'Auditing & Assurance';
    
    // Load config metadata
    const configData = (typeof servicesConfig !== 'undefined' ? servicesConfig.find(s => s.id === serviceId) : null) || { title: targetName, detailedDesc: "Expert advisory and compliance solutions.", theme: "blue" };

    // Load data from services_detail.js
    if (typeof servicesDetail === 'undefined') {
        console.error("servicesDetail not loaded");
        return;
    }
    const detailedData = servicesDetail.services.find(s => s.name === targetName) || servicesDetail.services[0];

    document.title = `${detailedData.name} | SKPM & Associates LLP`;

    // Map themes to SVG icons for the hero box
    const heroIcons = {
        audit: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><path d="m20 21-4.35-4.35"></path></svg>',
        tax: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
        advisory: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        nri: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        governance: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
        valuation: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>',
        indas: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        cfo: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
        succession: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"></path></svg>',
        rera: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><line x1="9" y1="11" x2="9" y2="21"></line><line x1="15" y1="11" x2="15" y2="21"></line></svg>',
        default: '<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    };
    
    // Choose icon based on serviceId
    const currentHeroIcon = heroIcons[serviceId] || heroIcons.default;

    root.innerHTML = `
        <div class="sd-hero-wrapper">
            <div class="sd-container" style="padding-bottom: 2rem;">
                <a href="${servicesPrefix}services.html" class="sd-back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to All Services
                </a>

                <header class="sd-hero-content">
                    <div class="sd-main-icon-box">
                        ${currentHeroIcon}
                    </div>
                    <div class="sd-hero-text">
                        <h1>${detailedData.name}</h1>
                        <p>${configData.detailedDesc}</p>
                    </div>
                </header>
            </div>
        </div>

        <div class="sd-container" style="padding-top: 0;">
            <div class="sd-stat-row">
                <div class="sd-stat-card blue">
                    <div class="sd-stat-icon blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div class="sd-stat-info">
                        <span class="num">${detailedData.keyFeatures.length}+</span>
                        <span class="label">Key Features</span>
                    </div>
                </div>
                <div class="sd-stat-card green">
                    <div class="sd-stat-icon green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </div>
                    <div class="sd-stat-info">
                        <span class="num">${detailedData.benefits.length}+</span>
                        <span class="label">Benefits</span>
                    </div>
                </div>
                <div class="sd-stat-card purple">
                    <div class="sd-stat-icon purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </div>
                    <div class="sd-stat-info">
                        <span class="num">${detailedData.whatYouGet.length}+</span>
                        <span class="label">Deliverables</span>
                    </div>
                </div>
            </div>

            <!-- Content Sections from Figma -->
            <section class="sd-section-card">
                <div class="sd-section-header">
                    <div class="sd-header-icon bg-blue-main">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 11 15 8 12"></polyline></svg>
                    </div>
                    <h2 class="global-heading" style="font-size: 2.2rem; margin:0;">Key Features</h2>
                </div>
                <div class="sd-features-grid">
                    ${detailedData.keyFeatures.map(feature => `
                        <div class="sd-feature-pill">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 11 15 8 12"></polyline></svg>
                            ${feature}
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="sd-section-card">
                <div class="sd-section-header">
                    <div class="sd-header-icon bg-green-main">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <h2 class="global-heading" style="font-size: 2.2rem; margin:0;">Benefits You'll Receive</h2>
                </div>
                <div class="sd-benefits-list">
                    ${detailedData.benefits.map(benefit => `
                        <div class="sd-benefit-bar">
                            <div class="bullet-dot"></div>
                            ${benefit}
                        </div>
                    `).join('')}
                </div>
            </section>

            <div class="sd-split-grid">
                <section class="sd-compact-card white">
                    <div class="sd-section-header">
                        <div class="sd-header-icon bg-blue-main">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        </div>
                        <h2 class="global-heading" style="font-size: 2rem; margin:0;">Perfect For</h2>
                    </div>
                    <div class="sd-compact-list">
                        ${detailedData.perfectFor.map(item => `
                            <div class="sd-compact-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                ${item}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="sd-compact-card white">
                    <div class="sd-section-header">
                        <div class="sd-header-icon bg-purple-main">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <h2 class="global-heading" style="font-size: 2rem; margin:0;">What You Get</h2>
                    </div>
                    <div class="sd-compact-list">
                        ${detailedData.whatYouGet.map(item => `
                            <div class="sd-compact-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 11 15 8 12"></polyline></svg>
                                ${item}
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>

            <div class="sd-cta-banner">
                <h2 class="global-heading-light" style="font-size: 2.2rem; margin-bottom: 1rem;">Ready to optimize your compliance?</h2>
                <p class="global-body-light" style="max-width: 600px; margin: 0 auto 2rem;">Connect with our experts today for a tailored roadmap.</p>
                <button type="button" class="sd-primary-btn contact-popup-trigger">
                    Get Started with SKPM
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        </div>
    `;
}

function heroHexBgHTML() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0" aria-hidden="true">
  <defs>
    <pattern id="hp1" width="60" height="52" patternUnits="userSpaceOnUse">
      <polygon points="30,2 56,16 56,36 30,50 4,36 4,16" fill="none" stroke="rgba(99,160,255,0.18)" stroke-width="1"/>
    </pattern>
    <pattern id="hp2" width="60" height="52" patternUnits="userSpaceOnUse" x="30" y="26">
      <polygon points="30,2 56,16 56,36 30,50 4,36 4,16" fill="none" stroke="rgba(99,160,255,0.10)" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="hm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0c1f4a"/>
      <stop offset="40%" stop-color="#0c1f4a"/>
      <stop offset="52%" stop-color="#0c1f4a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0c1f4a" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="ho" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="700" fill="url(#hp1)"/>
  <rect width="1200" height="700" fill="url(#hp2)"/>
  <rect width="1200" height="700" fill="url(#hm)"/>
  <polygon points="900,145 948,172 948,228 900,255 852,228 852,172" fill="rgba(59,130,246,0.20)" stroke="rgba(99,160,255,0.60)" stroke-width="1.5"/>
  <polygon points="790,350 825,370 825,410 790,430 755,410 755,370" fill="rgba(59,130,246,0.12)" stroke="rgba(99,160,255,0.40)" stroke-width="1.5"/>
  <polygon points="1050,113 1078,129 1078,161 1050,177 1022,161 1022,129" fill="rgba(59,130,246,0.18)" stroke="rgba(99,160,255,0.55)" stroke-width="1.5"/>
  <polygon points="1110,350 1162,380 1162,440 1110,470 1058,440 1058,380" fill="rgba(59,130,246,0.08)" stroke="rgba(99,160,255,0.25)" stroke-width="1"/>
  <polygon points="660,80 690,98 690,133 660,150 630,133 630,98" fill="rgba(59,130,246,0.10)" stroke="rgba(99,160,255,0.30)" stroke-width="1"/>
  <polygon points="870,500 896,515 896,545 870,560 844,545 844,515" fill="rgba(59,130,246,0.15)" stroke="rgba(99,160,255,0.45)" stroke-width="1.5"/>
  <polygon points="1000,272 1042,296 1042,344 1000,368 958,344 958,296" fill="rgba(59,130,246,0.08)" stroke="rgba(99,160,255,0.22)" stroke-width="1"/>
  <polygon points="710,456 731,468 731,492 710,504 689,492 689,468" fill="rgba(59,130,246,0.10)" stroke="rgba(99,160,255,0.32)" stroke-width="1"/>
  <ellipse cx="970" cy="350" rx="130" ry="130" fill="url(#ho)"/>
</svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.services-hero');
    if (el) el.insertAdjacentHTML('afterbegin', heroHexBgHTML());
});

/**
 * About Us Page Rendering
 */
function renderAboutPage() {
    const root = document.getElementById('about-page-root');
    if (!root || typeof aboutConfig === 'undefined') return;

    const { hero, story, foundation, coreValues, leadership } = aboutConfig;

    const aboutIcons = {
        vision: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        mission: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 8v8"/></svg>',
        values: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        shield: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        award: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
        zap: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        users: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><circle cx="17" cy="7" r="4"/></svg>',
        target: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
    };

    root.innerHTML = `
        <section class="about-hero">
            <div class="container">
                <h1>${hero.title.replace('Financial Journey', '<br><span class="title-gradient">Financial Journey</span>')}</h1>
                <p>${hero.description}</p>
                
            </div>
        </section>

        <section class="story-section">
            <div class="container">
                <div class="story-grid">
                    <div class="story-content">
                        <div style="margin-bottom: 1rem; text-align: center;">
                            <span class="hero-badge">${story.badge}</span>
                        </div>
                        <h2 class="global-heading">${story.title}</h2>
                        <p class="global-body">${story.description1}</p>
                        <p class="global-body">${story.description2}</p>
                        
                        <ul class="story-check-list">
                            ${story.checkmarks.map(check => `
                                <li>
                                    <svg class="story-check-icon" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#E0F2FE"/>
                                        <path d="M8 12l3 3 5-5" stroke="#0061FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    ${check}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="story-image-box">
                        <img src="${resolveAssetPath(story.image)}" alt="Work space meeting">
                    </div>
                </div>
            </div>
        </section>

        <section class="foundation-section">
            <div class="container">
                <div class="text-center" style="display: flex; flex-direction: column; align-items: center;">
                    <div style="margin-bottom: 1rem;">
                        <span class="hero-badge">${foundation.badge}</span>
                    </div>
                    <h2 class="global-heading" style="margin-bottom: 1.5rem;">${foundation.title}</h2>
                    <p class="global-body" style="max-width: 700px; margin: 0 auto;">${foundation.subtitle}</p>
                </div>

                <div class="foundation-grid">
                    ${foundation.cards.map(card => `
                        <div class="vm-card vm-${card.icon}">
                            <div class="vm-icon-box">
                                ${aboutIcons[card.icon]}
                            </div>
                            <h3 class="global-heading" style="font-size: 1.8rem;">${card.title}</h3>
                            <p class="global-body">${card.text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="leadership-section">
            <div class="container" style="max-width: 1320px;">
                <div class="text-center" style="display: flex; flex-direction: column; align-items: center;">
                    <div style="margin-bottom: 0.5rem;">
                        <span class="hero-badge">${leadership.badge}</span>
                    </div>
                    <h2 class="global-heading" style="margin-bottom: 0.5rem;">${leadership.title}</h2>
                    <p class="global-body" style="max-width: 760px; margin: 0 auto;">${leadership.subtitle || ''}</p>
                </div>

                <div class="team-grid" style="margin-top: 1rem;">
                    ${leadership.partners.map((partner, index) => {
                        const fallbackProfile = (siteConfig.teamMembers && siteConfig.teamMembers[index]) ? siteConfig.teamMembers[index] : {};
                        const displayName = partner.fullName || partner.name || '';
                        const displayDesignation = partner.designation || '';
                        const imagePath = partner.image || fallbackProfile.imagePath || '';

                        return '<div class="team-card about-member-card" data-member-index="' + index + '">' +
                               '<div class="team-img-wrapper">' +
                               '<img src="' + resolveAssetPath(imagePath) + '" alt="' + displayName + '">' +
                               '<div class="member-card-hover-overlay">' +
                               '<span class="member-view-profile-btn">View Profile <span class="btn-arrow-box"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></span></span>' +
                               '</div>' +
                               '</div>' +
                               '<div class="team-info">' +
                               '<h3>' + displayName + '</h3>' +
                               '<p class="designation">' + displayDesignation + '</p>' +
                               '</div>' +
                               '</div>';
                    }).join('')}
                </div>
            </div>
        </section>

        <div class="about-member-modal" id="about-member-modal" aria-hidden="true">
            <div class="about-member-modal-backdrop" data-about-modal-close="true"></div>
            <div class="about-member-modal-panel" role="dialog" aria-modal="true" aria-labelledby="about-member-modal-name">
                <button type="button" class="about-member-modal-close" aria-label="Close profile" data-about-modal-close="true">&times;</button>
                <div class="about-member-modal-grid">
                    <aside class="about-member-modal-media">
                        <img id="about-member-modal-image" alt="">
                        <div class="about-member-modal-media-overlay">
                            <h3 id="about-member-modal-name"></h3>
                            <p id="about-member-modal-role"></p>
                            <div class="about-member-modal-chips" id="about-member-modal-chips"></div>
                        </div>
                    </aside>
                    <div class="about-member-modal-content">
                        <p class="about-member-modal-bio" id="about-member-modal-bio"></p>
                        <div class="about-member-modal-section">
                            <h4>
                                <span class="modal-section-icon">
                                    <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                                </span>
                                Specialisations
                            </h4>
                            <ul id="about-member-modal-specializations"></ul>
                        </div>
                        <div class="about-member-modal-meta">
                            <div class="about-member-modal-meta-card about-member-modal-edu">
                                <h5>
                                    <span class="modal-meta-icon modal-meta-icon-edu">
                                        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                    </span>
                                    Education
                                </h5>
                                <p id="about-member-modal-education"></p>
                            </div>
                            <div class="about-member-modal-meta-card about-member-modal-achievement">
                                <h5>
                                    <span class="modal-meta-icon modal-meta-icon-ach">
                                        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
                                    </span>
                                    Key Achievement
                                </h5>
                                <p id="about-member-modal-achievement"></p>
                            </div>
                        </div>
                        <div class="about-member-modal-actions">
                            <a id="about-member-modal-linkedin" class="about-member-action-linkedin" href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a id="about-member-modal-email" class="about-member-action-email" href="#">Email</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const memberCards = root.querySelectorAll('.about-member-card');
    const memberModal = root.querySelector('#about-member-modal');
    if (!memberCards.length || !memberModal) return;

    const modalImage = root.querySelector('#about-member-modal-image');
    const modalName = root.querySelector('#about-member-modal-name');
    const modalRole = root.querySelector('#about-member-modal-role');
    const modalBio = root.querySelector('#about-member-modal-bio');
    const modalChips = root.querySelector('#about-member-modal-chips');
    const modalSpecs = root.querySelector('#about-member-modal-specializations');
    const modalEducation = root.querySelector('#about-member-modal-education');
    const modalAchievement = root.querySelector('#about-member-modal-achievement');
    const modalLinkedin = root.querySelector('#about-member-modal-linkedin');
    const modalEmail = root.querySelector('#about-member-modal-email');

    const sampleSpecializations = [
        'Income Tax Planning & Advisory',
        'GST Compliance & Litigation',
        'International Taxation & Transfer Pricing',
        'Corporate Tax Structuring',
        'Tax Due Diligence'
    ];

    const closeMemberModal = () => {
        memberModal.classList.remove('is-open');
        memberModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const openMemberModal = (index) => {
        const partner = leadership.partners[index];
        const fallbackProfile = (siteConfig.teamMembers && siteConfig.teamMembers[index]) ? siteConfig.teamMembers[index] : {};
        if (!partner) return;

        const displayName = partner.fullName || partner.name || 'Team Member';
        const displayRole = partner.designation || 'Partner';
        const displayImage = partner.popupImage || partner.image || fallbackProfile.imagePath || '';
        const displayBio = partner.bio || `${displayName} is a valued member of our leadership team with deep professional expertise and a strong commitment to client outcomes.`;
        const displaySpecs = Array.isArray(partner.specializations) && partner.specializations.length ? partner.specializations : sampleSpecializations;
        const displayEducation = partner.education || 'B.Com (Hons) · Professional Certification';
        const displayAchievement = partner.achievement || 'Successfully led multiple high-impact client mandates.';
        const linkedin = partner.linkedin || fallbackProfile.linkedin || '';

        modalImage.src = resolveAssetPath(displayImage);
        modalImage.alt = displayName;
        modalName.textContent = displayName;
        modalRole.textContent = displayRole;
        modalBio.textContent = displayBio;
        modalEducation.textContent = displayEducation;
        modalAchievement.textContent = displayAchievement;
        modalSpecs.innerHTML = displaySpecs.map(item => `<li>${item}</li>`).join('');
        modalChips.innerHTML = '';
        modalChips.style.display = 'none';
        modalLinkedin.href = linkedin || '#';
        modalLinkedin.style.pointerEvents = linkedin ? 'auto' : 'none';
        modalLinkedin.style.opacity = linkedin ? '1' : '0.6';
        modalEmail.href = `mailto:${partner.email || siteConfig.contactInfo.email}`;

        memberModal.classList.add('is-open');
        memberModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    memberCards.forEach((card) => {
        card.addEventListener('click', () => {
            openMemberModal(Number(card.dataset.memberIndex));
        });
    });

    memberModal.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.dataset.aboutModalClose === 'true') {
            closeMemberModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && memberModal.classList.contains('is-open')) {
            closeMemberModal();
        }
    });
}

// Shared Form Submission Overlay
(function () {
    const overlayHTML = `
    <div class="fso-overlay" id="fso-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="fso-backdrop"></div>
        <div class="fso-card">
            <div id="fso-loading">
                <div class="fso-spinner"></div>
                <p class="fso-msg" style="margin-top:1rem;">Submitting your details&hellip;</p>
            </div>
            <div id="fso-success" style="display:none; flex-direction:column; align-items:center; gap:1rem;">
                <div class="fso-success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="16 10 11 15 8 12"/>
                    </svg>
                </div>
                <h3 class="fso-title" id="fso-success-title">Thank You!</h3>
                <p class="fso-msg" id="fso-success-msg"></p>
                <button type="button" class="fso-close-btn" id="fso-close-btn">Close</button>
            </div>
        </div>
    </div>`;
    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        document.getElementById('fso-close-btn').addEventListener('click', window._fsoClose);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window._fsoClose(); });
    });

    window._fsoShow = function (state, successMsg) {
        const overlay = document.getElementById('fso-overlay');
        const loading = document.getElementById('fso-loading');
        const success = document.getElementById('fso-success');
        if (!overlay) return;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (state === 'loading') {
            loading.style.display = 'flex';
            success.style.display = 'none';
        } else {
            loading.style.display = 'none';
            if (successMsg) document.getElementById('fso-success-msg').textContent = successMsg;
            success.style.display = 'flex';
        }
    };

    window._fsoClose = function () {
        const overlay = document.getElementById('fso-overlay');
        if (!overlay) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };
}());

// Contact Form Submission Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const messageDiv = document.getElementById('form-message');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            messageDiv.style.display = 'none';
            window._fsoShow('loading');

            fetch(this.action, { method: 'POST', body: new FormData(this) })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        contactForm.reset();
                        window._fsoShow('success', 'Thank you! Your message has been received. Our team will get back to you within 24 hours.');
                    } else {
                        throw new Error(data.error || 'Unknown error occurred');
                    }
                })
                .catch(error => {
                    window._fsoClose();
                    messageDiv.textContent = 'Oops! Something went wrong. Please try again later.';
                    messageDiv.style.color = '#DC2626';
                    messageDiv.style.backgroundColor = '#FEE2E2';
                    messageDiv.style.display = 'block';
                    console.error('Form submission error:', error);
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});

// Careers Form Submission Handler
document.addEventListener('DOMContentLoaded', () => {
    const careersForm = document.getElementById('careers-form');
    if (!careersForm) return;

    careersForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const messageDiv = document.getElementById('careers-form-message');
        const submitBtn = this.querySelector('button[type="submit"]');
        const resumeInput = document.getElementById('c-resume');
        const originalBtnText = submitBtn.innerHTML;
        const maxBytes = 10 * 1024 * 1024;
        const allowedExt = ['pdf', 'doc', 'docx', 'rtf', 'txt', 'odt'];

        if (resumeInput && resumeInput.files && resumeInput.files.length > 0) {
            const file = resumeInput.files[0];
            const fileExt = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
            if (!allowedExt.includes(fileExt)) {
                messageDiv.textContent = 'Invalid resume format. Please upload PDF, DOC, DOCX, RTF, TXT, or ODT.';
                messageDiv.style.color = '#DC2626';
                messageDiv.style.backgroundColor = '#FEE2E2';
                messageDiv.style.display = 'block';
                return;
            }
            if (file.size > maxBytes) {
                messageDiv.textContent = 'Resume file is too large. Maximum allowed size is 10 MB.';
                messageDiv.style.color = '#DC2626';
                messageDiv.style.backgroundColor = '#FEE2E2';
                messageDiv.style.display = 'block';
                return;
            }
        }

        submitBtn.disabled = true;
        messageDiv.style.display = 'none';
        window._fsoShow('loading');

        try {
            const formData = new FormData(this);
            formData.delete('resume'); // Apps Script e.parameter can't read raw binary — replaced with base64 fields below
            formData.append('form_type', 'careers');
            formData.append('sheet_name', 'careers');
            formData.append('notification_email', 'contact@skpm.co.in');
            formData.append('notification_subject', `New Career Application - ${formData.get('name') || ''}`);

            if (resumeInput && resumeInput.files && resumeInput.files.length > 0) {
                const file = resumeInput.files[0];
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                formData.append('resume_base64', base64);
                formData.append('resume_name', file.name);
                formData.append('resume_mime', file.type || 'application/octet-stream');
            }

            await fetch(this.action, { method: 'POST', body: formData, mode: 'no-cors' });

            careersForm.reset();
            window._fsoShow('success', 'Thank you! Your application has been submitted successfully. We will review it and get back to you soon.');
        } catch (error) {
            window._fsoClose();
            messageDiv.textContent = 'Oops! Something went wrong. Please try again later.';
            messageDiv.style.color = '#DC2626';
            messageDiv.style.backgroundColor = '#FEE2E2';
            messageDiv.style.display = 'block';
            console.error('Careers form submission error:', error);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

// Contact Popup Modal
document.addEventListener('DOMContentLoaded', () => {
    const FORM_ACTION = 'https://script.google.com/macros/s/AKfycbxhhuQDkzdh_wme057uVBRUrQtSqVjFOqgRuLHvm3yBdMdvn-yzPraYYtAZ_hUPFFeo/exec';

    const modalHTML = `
    <div class="contact-popup-modal" id="contact-popup-modal" aria-hidden="true">
        <div class="contact-popup-backdrop" id="contact-popup-backdrop"></div>
        <div class="contact-popup-panel" role="dialog" aria-modal="true" aria-label="Get In Touch">
            <button type="button" class="contact-popup-close" id="contact-popup-close" aria-label="Close">&times;</button>
            <div class="contact-popup-inner">

                <!-- Default: form view -->
                <div id="contact-popup-form-view">
                    <div class="contact-popup-header">
                        <h2 class="contact-popup-title">Get In Touch</h2>
                        <p class="contact-popup-subtitle">Fill out the form and our team will get back to you within 24 hours.</p>
                    </div>
                    <form id="contact-popup-form" action="${FORM_ACTION}" method="POST" novalidate>
                        <div id="contact-popup-error" style="display:none; padding:0.9rem 1rem; border-radius:8px; margin-bottom:1.2rem; font-weight:600; font-size:0.9rem; color:#DC2626; background:#FEE2E2;"></div>
                        <div class="form-group">
                            <label>Full Name <span style="color:#ef4444;">*</span></label>
                            <input type="text" name="name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address <span style="color:#ef4444;">*</span></label>
                            <input type="email" name="email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number <span style="color:#ef4444;">*</span></label>
                            <input type="tel" name="phone" class="form-control" required minlength="10">
                        </div>
                        <div class="form-group">
                            <label>Message <span style="color:#ef4444;">*</span></label>
                            <textarea name="message" class="form-control" rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-submit" id="contact-popup-submit">
                            Send Message
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>

                <!-- Loading view -->
                <div id="contact-popup-loading-view" style="display:none;">
                    <div class="contact-popup-state-view">
                        <div class="contact-popup-spinner"></div>
                        <p class="contact-popup-state-msg">Submitting your form...</p>
                    </div>
                </div>

                <!-- Success view -->
                <div id="contact-popup-success-view" style="display:none;">
                    <div class="contact-popup-state-view">
                        <div class="contact-popup-success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>
                        </div>
                        <h3 class="contact-popup-success-title">Message Sent!</h3>
                        <p class="contact-popup-state-msg">Thank you! Our team will get back to you within 24 hours.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('contact-popup-modal');
    const backdrop = document.getElementById('contact-popup-backdrop');
    const closeBtn = document.getElementById('contact-popup-close');
    const form = document.getElementById('contact-popup-form');
    const formView = document.getElementById('contact-popup-form-view');
    const loadingView = document.getElementById('contact-popup-loading-view');
    const successView = document.getElementById('contact-popup-success-view');
    const errorDiv = document.getElementById('contact-popup-error');

    const showView = (view) => {
        formView.style.display = view === 'form' ? 'block' : 'none';
        loadingView.style.display = view === 'loading' ? 'block' : 'none';
        successView.style.display = view === 'success' ? 'block' : 'none';
    };

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        form.reset();
        errorDiv.style.display = 'none';
        showView('form');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
        if (e.target.closest('.contact-popup-trigger')) {
            e.preventDefault();
            openModal();
        }
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        errorDiv.style.display = 'none';
        showView('loading');

        fetch(this.action, { method: 'POST', body: new FormData(this) })
            .then(r => r.json())
            .then(data => {
                if (data.result === 'success') {
                    showView('success');
                    form.reset();
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(() => {
                showView('form');
                errorDiv.textContent = 'Oops! Something went wrong. Please try again later.';
                errorDiv.style.display = 'block';
            });
    });
});
