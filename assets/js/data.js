/* ============================================================
   SITE CONTENT — edit this file only. No other file needs
   touching to change text, projects, services or contact info.
   ============================================================ */
window.SITE = {

  /* ---------- who you are ---------- */
  name:      "M. Shahmeer",
  role:      "Web Designer & Developer",
  location:  "Faisalabad, Pakistan",

  /* Shown large on the hero. Keep it to one sentence. */
  tagline:   "I build websites that make businesses look like the real thing.",
  intro:     "Fast, mobile-first websites and custom software for businesses in the UK, USA, Saudi Arabia and Pakistan — from local service companies to a full accounting platform.",

  /* ---------- contact ---------- */
  phone:     "+92 321 4668439",
  phoneRaw:  "923214668439",          // digits only, for tel: and wa.me links
  email:     "shahmeer1kashif@gmail.com",
  whatsapp:  true,

  /* ---------- the numbers on the hero ---------- */
  stats: [
    { value: "14+", label: "Projects delivered" },
    { value: "4",   label: "Countries served"   },
    { value: "3+",  label: "Years building"     }
  ],


  /* ============================================================
     HERO SYSTEM — the portal interface.
     Everything the hero renders comes from here.
     ============================================================ */

  /* Swap your photo by changing this one line. Put the file in
     assets/img/ and point at it. A square image works best. */
  PROFILE_IMAGE: "assets/img/shahmeer.webp?v=104",
  PROFILE_FALLBACK: "assets/img/shahmeer.png?v=104",

  /* The wired navigation panels down the left.
     "to" is the id it scrolls to — keep the # . */
  navModules: [
    { n: "01", label: "HOME",       to: "#top",        icon: "home"   },
    { n: "02", label: "ABOUT",      to: "#about",      icon: "user"   },
    { n: "03", label: "SERVICES",   to: "#services",   icon: "layers" },
    { n: "04", label: "WORK",       to: "#work",       icon: "case"   },
    { n: "05", label: "PROCESS",    to: "#process",    icon: "atom"   },
    { n: "06", label: "EXPERIENCE", to: "#experience", icon: "medal"  },
    { n: "07", label: "CONTACT",    to: "#contact",    icon: "send"   }
  ],

  /* The four chips around the portal. */
  portalLabels: {
    top:    "Full stack developer",
    bottom: "Digital strategist",
    left:   "Creative thinker",
    right:  "Problem solver"
  },

  /* The line across the bottom console. The two phrases in `lit` are
     picked out in cyan. */
  heroQuote: {
    text: "I build digital experiences that solve problems and scale businesses.",
    lit:  ["solve problems", "scale businesses"]
  },

  statusLabel: "Current status",
  statusValue: "Available for new projects",
  ctaKicker:   "Let’s build",
  ctaKickerEm: "Something amazing",

  /* SYSTEM OUTPUT — the readout panel, top right.
     These are COUNTED FROM YOUR OWN projects list above, not invented:
       14 = number of entries in projects[]
       11 = entries whose work[] mentions a website / storefront build
       12 = distinct clients (the three Life Care builds are one client)
        3 = years, the only figure carried over from your old stats
     Change any of them here. */
  systemOutput: [
    { key: "projectsDelivered", value: 14, suffix: "+", label: "Projects delivered", viz: "line",  icon: "chart" },
    { key: "websitesBuilt",     value: 11, suffix: "+", label: "Websites built",     viz: "bars",  icon: "globe" },
    { key: "clients",           value: 12, suffix: "",  label: "Brands worked with", viz: "nodes", icon: "badge" },
    { key: "yearsExperience",   value: 3,  suffix: "+", label: "Years experience",   viz: "ring",  icon: "clock" }
  ],

  /* CORE EXPERIENCE — the module list, bottom right.
     These are drawn from your own stack and services. The reference
     image you sent belongs to an SEO manager, so its list (Off-Page
     SEO, WooCommerce, Digital Marketing, Automation) is NOT copied in
     here. Add any that are genuinely yours — a client may ask. */
  coreExperience: [
    "Web Development",
    "Business Sites",
    "E-commerce",
    "Custom Systems",
    "Technical SEO",
    "Analytics",
    "WordPress",
    "Performance"
  ],

  /* The bottom console. The role is split across two lines: the first
     is the headline discipline, the second the supporting list. */
  systemLine:    "DIGITAL STRATEGIST • DEVELOPER • SEO SPECIALIST",
  rolePrimary:   "Digital strategist",
  roleSecondary: "Developer • SEO specialist • Problem solver",
  monogram:      "M",

  /* ---------- what you sell ---------- */
  services: [
    { icon: "layout",  title: "Business Websites",
      text: "Multi-page sites that load fast, rank well and turn visitors into phone calls. Built mobile-first, because that is where your customers actually are." },
    { icon: "cart",    title: "Online Stores",
      text: "Shopify builds and custom storefronts — product pages, checkout, payments and inventory wired up and working from day one." },
    { icon: "cpu",     title: "Custom Systems",
      text: "Queue systems, booking flows, payment and admin panels. The unglamorous software that quietly saves your staff hours every week." },
    { icon: "search",  title: "SEO & Performance",
      text: "Technical SEO, schema markup, Core Web Vitals. Getting you found, then making sure the page is quick enough to keep them there." },
    { icon: "brush",   title: "Design & Identity",
      text: "Layout, type and colour that make a small business look established. Design in service of trust, not decoration." },
    { icon: "wrench",  title: "Care & Maintenance",
      text: "Hosting, backups, updates and edits. You send a WhatsApp, it gets fixed. No ticket portal, no waiting a week." }
  ],

  /* ---------- portfolio ----------
     Add a thumbnail by dropping an image in assets/img/ and
     setting  img: "assets/img/yourfile.jpg"
     Leave img blank and a generated gradient card is used.       */
  projects: [
    { title: "PaidDesk",
      tag:   "SaaS Product",
      year:  "2026",
      text:  "A full accounting platform for UK businesses, sold as a one-time licence instead of a monthly subscription. Invoicing, recurring billing, automatic payment chasing, reporting and a customer portal — plus an AI assistant that performs real accounting tasks from a plain-English sentence.",
      work:  ["Product Design", "Web App", "Stripe & SumUp", "AI Assistant", "Marketing Site"],
      url:   "https://paiddesk.co.uk/",
      img:   "" },

    { title: "AcuraGold",
      tag:   "Construction · Saudi Arabia",
      year:  "2026",
      text:  "Brand site for a Madinah contractor delivering hotel renovations and MEP works for international operators across the Kingdom. Built to carry real weight — the audience is brand managers signing off work on properties that cannot close.",
      work:  ["Website", "Brand Presentation", "Case Studies"],
      url:   "https://acuragold.com/",
      img:   "" },

    { title: "Drape FX",
      tag:   "Events · UK",
      year:  "2026",
      text:  "Site for a Midlands event draping company trading since 1994 — LED starcloth, pipe and base, serge, voile and staging. Structured so a bride and a corporate event buyer each find their own service fast, then land on one quote form.",
      work:  ["Website", "Service Structure", "Quote Funnel", "SEO"],
      url:   "https://drapefx.co.uk/",
      img:   "" },

    { title: "BH Garage Door USA",
      tag:   "Service Business · USA",
      year:  "2026",
      text:  "Lead generation site for a Miami garage door company running 24/7 emergency callouts. Every layout decision serves one goal: get someone with a broken door to call or book before they bounce to a competitor.",
      work:  ["Website", "Lead Capture", "Online Booking", "Local SEO"],
      url:   "https://bhgaragedoorusa.com/",
      img:   "" },

    { title: "Abdullah Dairy Farm",
      tag:   "Local Business",
      year:  "2026",
      text:  "Daily milk delivery in Faisalabad — cow and buffalo milk, dahi, desi ghee and butter. Bilingual English and Urdu, built for customers ordering on a phone over a patchy connection, with calling and ordering never more than one tap away.",
      work:  ["Website", "Urdu / English", "Mobile-first", "Ordering"],
      url:   "https://abdullahdairyfarm.com/",
      img:   "" },

    { title: "Life Care Physio & Rehabilitation",
      tag:   "Healthcare",
      year:  "2026",
      text:  "A full clinic presence: 16-page website, service pages for every treatment, appointment booking and schema markup for local search. Built to bring in patients from Google, not just to exist.",
      work:  ["Website", "SEO", "Schema/JSON-LD", "Booking"],
      url:   "",
      img:   "" },

    { title: "Life Care Queue System",
      tag:   "Custom Software",
      year:  "2026",
      text:  "A token and queue manager for a busy clinic front desk. Calls patients in order, prints 80mm thermal slips and keeps the waiting room calm without anyone shouting names.",
      work:  ["Desktop App", "Thermal Printing", "Offline-first"],
      url:   "",
      img:   "" },

    { title: "Life Care Payment System",
      tag:   "Custom Software",
      year:  "2026",
      text:  "Billing and payment tracking built around how the clinic actually works — sessions, packages and part-payments, with receipts that reconcile at the end of the day.",
      work:  ["Payments", "Reporting", "Receipts"],
      url:   "",
      img:   "" },

    { title: "Shaevon",
      tag:   "E-commerce",
      year:  "2026",
      text:  "Shopify storefront build — product presentation, collection structure and a checkout path stripped of everything that gives a shopper a reason to leave.",
      work:  ["Shopify", "Theme Build", "Product UX"],
      url:   "",
      img:   "" },

    { title: "Usafi Cleaning Services",
      tag:   "Service Business",
      year:  "2026",
      text:  "Lead-generation site for a cleaning company. One job: make quoting effortless. Clear services, honest pricing cues and a quote form that people finish.",
      work:  ["Website", "Lead Capture", "Local SEO"],
      url:   "",
      img:   "" },

    { title: "Global Vintage House",
      tag:   "E-commerce",
      year:  "2026",
      text:  "Retail storefront with a catalogue that stays readable as it grows, and a browsing experience that survives a slow mobile connection.",
      work:  ["Storefront", "Catalogue", "Performance"],
      url:   "",
      img:   "" },

    { title: "Shahmeer Unstitched",
      tag:   "E-commerce",
      year:  "2025",
      text:  "Fabric and unstitched clothing store. Heavy on imagery, so the whole build was an exercise in shipping big photography without a slow page.",
      work:  ["Storefront", "Image Pipeline", "Mobile-first"],
      url:   "",
      img:   "" },

    { title: "Triangle",
      tag:   "Business Site",
      year:  "2025",
      text:  "Corporate site with a clear structure and a tight visual system — built so the client can add pages later without the design falling apart.",
      work:  ["Website", "Design System"],
      url:   "",
      img:   "" },

    { title: "Essential Vibration",
      tag:   "Business Site",
      year:  "2025",
      text:  "Product-led marketing site focused on one thing: explaining what the product does before the visitor loses interest.",
      work:  ["Website", "Copy Layout"],
      url:   "",
      img:   "" }
  ],

  /* ---------- how you work ---------- */
  process: [
    { step: "01", title: "We talk",
      text: "A call or a few WhatsApp messages. What the business does, who you want walking through the door, and what the site has to achieve. No forms, no discovery invoice.",
      points: ["Understand your goals", "Discuss the obstacles", "Agree what success looks like"] },
    { step: "02", title: "I plan it",
      text: "Pages, structure and a fixed quote. You know the price and the timeline before any work starts, and neither moves unless you change the scope.",
      points: ["Page-by-page plan", "Structure and strategy", "Fixed quote, fixed date"] },
    { step: "03", title: "I build it",
      text: "You see it on a live preview link as it comes together — not a mockup, the real thing. Feedback goes in as we go rather than in one painful round at the end.",
      points: ["Live preview from day one", "Your feedback as we go", "Speed and mobile checks"] },
    { step: "04", title: "It goes live",
      text: "Hosting, domain, SSL, Search Console, the lot. Then I stay reachable — because a site that nobody maintains stops earning within a year.",
      points: ["Launch and setup", "Search Console and tracking", "I stay reachable after"] }
  ],

  /* The reassurance bar under the process diagram. */
  processValues: [
    { icon: "shield", title: "Transparent",   text: "You know the price and the date before any work begins." },
    { icon: "people", title: "Collaborative", text: "You watch it being built on a live link, not at the end." },
    { icon: "target", title: "Direct",        text: "You deal with me. No account manager, no agency layers." },
    { icon: "gauge",  title: "Maintained",    text: "I stay reachable after launch, so the site keeps earning." }
  ],

  /* ---------- toolkit ---------- */
  stack: ["HTML5","CSS3","JavaScript","Three.js","PHP","MySQL","Shopify","WordPress","Node.js","Git","SEO / Schema","Figma"]
};
