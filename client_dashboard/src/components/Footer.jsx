import logoSrc from '../../images/s-k-p-m-associates-llp-chartered-accountants-1.png'
import mapsIcon from '../../images/maps.png'

// Mirrors the website's shared footer (script.js / config.js) — keep content in sync.
const QUICK_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'About Firm', href: '/pages/about/about.html' },
  { label: 'Industries We Cater', href: '/#industries' },
]

const USEFUL_LINKS = [
  { label: 'Income Tax Dept.', href: 'https://www.incometaxindia.gov.in/' },
  { label: 'Goods & Services Tax', href: 'https://www.gst.gov.in/' },
  { label: 'Ministry of Corporate Affairs', href: 'https://www.mca.gov.in/content/mca/global/en/home.html' },
  { label: 'Reserve Bank of India', href: 'https://www.rbi.org.in/' },
  { label: 'Central Board of Excise and Custom', href: 'https://www.cbic.gov.in/' },
]

const CONTACT = {
  address: '602, Akshay House, Behind Nagnath Par, Sadashiv Peth Pune, Maharashtra - 411030.',
  phone: '+91-8830239955',
  landline: '+91-20-47256542',
  email: 'contact@skpm.co.in',
  mapUrl: 'https://maps.app.goo.gl/Vrg5zsA7fe6bBWLf8',
  linkedin: 'https://www.linkedin.com/company/s-k-p-m-associates-llp/',
}

const headingStyle = {
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

const linkStyle = { color: 'rgba(255,255,255,0.72)' }

function FooterLink({ href, children, external }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-sm transition-colors"
      style={linkStyle}
      onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
      onMouseLeave={e => (e.currentTarget.style.color = linkStyle.color)}
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="dark-band">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.4fr] gap-10">

          {/* Brand */}
          <div>
            <img src={logoSrc} alt="SKPM & Associates LLP" className="h-14 w-auto object-contain" />
            <p className="text-sm mt-5 leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Your trusted partner for financial, taxation, and corporate governance solutions globally.
            </p>
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg mt-5 transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.342-4-3.085-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={headingStyle} className="mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(link => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 style={headingStyle} className="mb-5">Useful Links</h4>
            <ul className="space-y-3">
              {USEFUL_LINKS.map(link => (
                <li key={link.label}>
                  <FooterLink href={link.href} external>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={headingStyle} className="mb-5">Contact Us</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <li className="leading-relaxed">
                <strong className="text-white font-semibold">Address:</strong> {CONTACT.address}
              </li>
              <li>
                <strong className="text-white font-semibold">Phone:</strong>{' '}
                <FooterLink href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</FooterLink>
              </li>
              <li>
                <strong className="text-white font-semibold">Landline:</strong>{' '}
                <FooterLink href={`tel:${CONTACT.landline}`}>{CONTACT.landline}</FooterLink>
              </li>
              <li>
                <strong className="text-white font-semibold">Email:</strong>{' '}
                <FooterLink href={`mailto:${CONTACT.email}`}>{CONTACT.email}</FooterLink>
              </li>
              <li className="pt-2">
                <a
                  href={CONTACT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Maps"
                  className="inline-flex items-center gap-2.5 text-sm font-medium transition-colors"
                  style={{ color: '#38BDF8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#7dd3fc')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#38BDF8')}
                >
                  <img src={mapsIcon} alt="" className="w-7 h-7 object-contain" />
                  Google Maps
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            &copy; {new Date().getFullYear()} SKPM &amp; Associates LLP. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Powered by Ashish Takawale
          </p>
        </div>
      </div>
    </footer>
  )
}
