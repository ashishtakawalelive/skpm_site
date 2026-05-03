/**
 * Detailed Services Configuration for SKPM & Associates LLP
 * Each service includes metadata for both the listing grid and the detail page.
 */

const servicesConfig = [
    {
        id: "audit",
        title: "Auditing & Assurance",
        link: "audit.html",
        shortDesc: "Comprehensive financial statement audits and assurance services ensuring accuracy, compliance, and trust.",
        detailedDesc: "Our Auditing & Assurance services go beyond mere compliance. We provide deep insights into your business's financial health, identifying risks and opportunities for improvement. Our team utilizes advanced methodology to ensure your financial statements are accurate, reliable, and transparent.",
        expertise: ["Statutory Audits", "Tax Audits", "Internal Audits", "Forensic audits"],
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3v18"></path><path d="M5 7h14"></path><path d="M6 7l-3 7h6L6 7z"></path><path d="M18 7l-3 7h6l-3-7z"></path><path d="M8 21h8"></path></svg>',
        theme: "blue",
        bgImage: "images/services/audit.jpg"
    },
    {
        id: "tax",
        title: "Taxation Compliance & Litigation",
        link: "taxation.html",
        shortDesc: "Strategic tax planning, periodic compliance, and expert representation in complex litigation matters.",
        detailedDesc: "Navigating the complexities of tax laws requires strategic foresight and technical precision. We offer end-to-end taxation solutions, from routine filings to representing clients in high-stakes litigation before tax authorities.",
        expertise: ["Tax Planning", "GST Compliance", "Litigation Support"],
        icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M9 13h6"></path><path d="M9 17h6"></path><path d="M9 9h1"></path></svg>',
        theme: "teal",
        bgImage: "images/services/tax.jpg"
    },
    {
        id: "advisory",
        title: "Financial Advisory",
        link: "advisory.html",
        shortDesc: "Expert guidance on capital structuring, investment strategies, and long-term financial health.",
        detailedDesc: "Scale your business with confidence. Our financial advisory team helps you navigate complex transactions, raise capital, and optimize your financial structure for sustainable growth.",
        expertise: ["Capital Structuring", "M&A Advisory", "Project Finance"],
        icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="m7 15 4-4 4 4 5-7"></path><path d="M14 8h6v6"></path></svg>',
        theme: "green",
        bgImage: "images/services/advisory.jpg"
    },
    {
        id: "nri",
        title: "NRI Compliance & Advisory",
        link: "nri.html",
        shortDesc: "Specialized services for Non-Resident Indians including FEMA compliance and tax optimization.",
        detailedDesc: "Managing financial interests in India from abroad can be challenging. We provide dedicated support for NRIs to ensure seamless compliance with FEMA and Income Tax regulations.",
        expertise: ["FEMA Compliance", "Repatriation", "NRI Returns"],
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15 15 0 0 1 0 20"></path><path d="M12 2a15 15 0 0 0 0 20"></path></svg>',
        theme: "orange",
        bgImage: "images/services/nri.jpg"
    },
    {
        id: "governance",
        title: "Corporate Governance Services",
        link: "governance.html",
        shortDesc: "End-to-end support for board management, statutory secretarial compliance, and ethical oversight.",
        detailedDesc: "Build a foundation of trust. Our governance services ensure your organization operates with the highest standards of ethics, transparency, and legal compliance.",
        expertise: ["Secretarial Audit", "Board Advisory", "CSR Compliance"],
        icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18"></path><path d="M5 21V9"></path><path d="M19 21V9"></path><path d="M9 21V9"></path><path d="M15 21V9"></path><path d="M3 9h18"></path><path d="M12 3 3 9h18L12 3z"></path></svg>',
        theme: "purple",
        bgImage: "images/services/governance.jpg"
    },
    {
        id: "valuation",
        title: "Valuation",
        link: "valuation.html",
        shortDesc: "Professional business and asset valuation services for regulatory, tax, and strategic purposes.",
        detailedDesc: "Reliable valuations are the bedrock of transaction success. We combine deep market insights with analytical rigor to provide defensible valuation reports for all regulatory and strategic needs.",
        icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="m7 16 4-5 4 3 5-8"></path><path d="M17 6h3v3"></path></svg>',
        theme: "red",
        bgImage: "images/services/valuation.jpg"
    },
    {
        id: "indas",
        title: "Ind AS Implementation & Compliance",
        link: "indas.html",
        shortDesc: "Seamless transition and ongoing compliance support for Indian Accounting Standards.",
        detailedDesc: "Master the language of modern accounting. We provide full transition support and technical advisory to ensure your financial statements are fully Ind AS compliant and audit-ready.",
        icon: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 7h8"></path><path d="M8 11h7"></path></svg>',
        theme: "indigo",
        bgImage: "images/services/indas.jpg"
    },
    {
        id: "cfo",
        title: "Virtual CFO & Business Transformation Advisory",
        link: "cfo.html",
        shortDesc: "High-level financial leadership and strategic oversight for growing businesses and startups.",
        detailedDesc: "Get CFO-level expertise without the full-time cost. Our Virtual CFO services provide the strategic financial leadership you need to scale, professionalise, and transform your business operations.",
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
        theme: "cyan",
        bgImage: "images/services/cfo.jpg"
    },
    {
        id: "succession",
        title: "Succession Planning",
        link: "succession.html",
        shortDesc: "Expert guidance on wealth transfer and business continuity for families and promoters.",
        detailedDesc: "Preserve your legacy for generations to come. We help you design tax-efficient and legally robust succession structures that ensure smooth transitions and family harmony.",
        icon: '<svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6z"></path><path d="M14 2v4h4"></path><path d="M9 11h6"></path><path d="M9 15h6"></path><path d="M9 19h4"></path></svg>',
        theme: "amber",
        bgImage: "images/services/succession.jpg"
    },
    {
        id: "rera",
        title: "RERA Registration & Compliance",
        link: "rera.html",
        shortDesc: "Comprehensive support for real estate projects and agents under the RERA framework.",
        detailedDesc: "Navigate the real estate regulatory landscape with ease. We provide complete RERA compliance support, from project registration to quarterly reporting and fund certification.",
        icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M9 21v-6h6v6"></path><path d="M9 9h1"></path><path d="M14 9h1"></path><path d="M9 12h1"></path><path d="M14 12h1"></path></svg>',
        theme: "emerald",
        bgImage: "images/services/rera.jpg"
    }
];
