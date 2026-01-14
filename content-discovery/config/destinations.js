// Konfigurace destinací a jejich zdrojů pro content discovery

export const destinations = {
  kastrup: {
    name: "Kastrup (Dánsko)",
    domain: "kastrup.cz",
    country: "Denmark",
    language: "da", // Dánština
    sources: [
      {
        name: "Visit Copenhagen",
        url: "https://www.visitcopenhagen.com/copenhagen/plan-your-trip/news",
        type: "news",
        selectors: {
          title: "h2, h3",
          link: "a",
          date: ".date, time",
          description: "p, .excerpt"
        }
      },
      {
        name: "Copenhagen Airport News",
        url: "https://www.cph.dk/en/about-cph/news",
        type: "news",
        selectors: {
          title: "h2, h3",
          link: "a",
          date: ".date, time",
          description: "p"
        }
      },
      {
        name: "The Local Denmark",
        url: "https://www.thelocal.dk/",
        type: "news",
        selectors: {
          title: "h2, h3, .headline",
          link: "a",
          date: ".date, time",
          description: "p, .summary"
        }
      }
    ],
    keywords: [
      "Kastrup", "Copenhagen", "København", "airport", "letiště",
      "turistika", "cestování", "dánsko", "denmark"
    ]
  },
  
  attersee: {
    name: "Attersee (Rakousko)",
    domain: "attersee.cz",
    country: "Austria",
    language: "de", // Němčina
    sources: [
      {
        name: "Salzkammergut",
        url: "https://www.salzkammergut.at/en",
        type: "tourism",
        selectors: {
          title: "h2, h3, .title",
          link: "a",
          date: ".date, time",
          description: "p, .description"
        }
      },
      {
        name: "Austria.info",
        url: "https://www.austria.info/en",
        type: "tourism",
        selectors: {
          title: "h2, h3",
          link: "a",
          date: ".date, time",
          description: "p"
        }
      },
      {
        name: "The Local Austria",
        url: "https://www.thelocal.at/",
        type: "news",
        selectors: {
          title: "h2, h3, .headline",
          link: "a",
          date: ".date, time",
          description: "p, .summary"
        }
      }
    ],
    keywords: [
      "Attersee", "Salzkammergut", "Rakousko", "Austria",
      "jezero", "turistika", "cestování", "alpy"
    ]
  },
  
  ithaka: {
    name: "Ithaka (Řecko)",
    domain: "ithaka.cz",
    country: "Greece",
    language: "el", // Řečtina
    sources: [
      {
        name: "Visit Greece",
        url: "https://www.visitgreece.gr/",
        type: "tourism",
        selectors: {
          title: "h2, h3, .title",
          link: "a",
          date: ".date, time",
          description: "p, .description"
        }
      },
      {
        name: "Greek Travel Pages",
        url: "https://www.gtp.gr/",
        type: "news",
        selectors: {
          title: "h2, h3",
          link: "a",
          date: ".date, time",
          description: "p"
        }
      },
      {
        name: "The Local Greece",
        url: "https://www.thelocal.gr/",
        type: "news",
        selectors: {
          title: "h2, h3, .headline",
          link: "a",
          date: ".date, time",
          description: "p, .summary"
        }
      }
    ],
    keywords: [
      "Ithaka", "Ithaca", "Ιθάκη", "Řecko", "Greece",
      "ostrov", "turistika", "cestování", "řecké ostrovy"
    ]
  }
};

// Obecné nastavení pro scraping
export const scrapingConfig = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  timeout: 10000, // 10 sekund
  maxRetries: 3,
  delayBetweenRequests: 2000, // 2 sekundy mezi requesty
  maxArticlesPerSource: 10
};
