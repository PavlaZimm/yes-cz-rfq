import axios from 'axios';
import * as cheerio from 'cheerio';
import { destinations, scrapingConfig } from '../config/destinations.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Hlavní scraper třída
 */
class ContentScraper {
  constructor() {
    this.results = [];
  }

  /**
   * Získá obsah z URL
   */
  async fetchPage(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': scrapingConfig.userAgent
        },
        timeout: scrapingConfig.timeout
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Chyba při načítání ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Parsuje HTML a extrahuje články
   */
  parseArticles(html, source) {
    const $ = cheerio.load(html);
    const articles = [];
    
    try {
      // Najdeme všechny potenciální články
      const articleElements = $('article, .article, .post, .news-item, .card').slice(0, scrapingConfig.maxArticlesPerSource);
      
      if (articleElements.length === 0) {
        // Fallback: zkusíme najít odkazy s titulky
        $('a').each((i, elem) => {
          if (articles.length >= scrapingConfig.maxArticlesPerSource) return false;
          
          const $link = $(elem);
          const href = $link.attr('href');
          const title = $link.text().trim() || $link.find('h2, h3').text().trim();
          
          if (title && href && title.length > 10) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).href;
            articles.push({
              title: title.substring(0, 200),
              url: fullUrl,
              description: $link.next('p').text().trim().substring(0, 300) || '',
              date: this.extractDate($link),
              source: source.name
            });
          }
        });
      } else {
        articleElements.each((i, elem) => {
          const $article = $(elem);
          
          const title = $article.find(source.selectors.title).first().text().trim() ||
                       $article.find('h2, h3').first().text().trim() ||
                       $article.attr('title') || '';
          
          const link = $article.find(source.selectors.link).first().attr('href') ||
                      $article.attr('href') ||
                      $article.find('a').first().attr('href') || '';
          
          const description = $article.find(source.selectors.description).first().text().trim() ||
                            $article.find('p').first().text().trim() || '';
          
          if (title && link) {
            const fullUrl = link.startsWith('http') ? link : new URL(link, source.url).href;
            articles.push({
              title: title.substring(0, 200),
              url: fullUrl,
              description: description.substring(0, 300),
              date: this.extractDate($article),
              source: source.name
            });
          }
        });
      }
    } catch (error) {
      console.error(`❌ Chyba při parsování ${source.name}:`, error.message);
    }
    
    return articles;
  }

  /**
   * Extrahuje datum z elementu
   */
  extractDate($element) {
    const dateText = $element.find('.date, time, [datetime]').first().text().trim() ||
                    $element.find('time').attr('datetime') ||
                    $element.attr('datetime') || '';
    
    if (dateText) {
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    return new Date().toISOString(); // Fallback na aktuální datum
  }

  /**
   * Skóruje relevanci článku podle klíčových slov
   */
  scoreRelevance(article, keywords) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    return score;
  }

  /**
   * Scrapuje jeden zdroj
   */
  async scrapeSource(source, destination) {
    console.log(`🔍 Scrapuji ${source.name}...`);
    
    const html = await this.fetchPage(source.url);
    if (!html) {
      return [];
    }
    
    // Počkáme před dalším requestem
    await new Promise(resolve => setTimeout(resolve, scrapingConfig.delayBetweenRequests));
    
    const articles = this.parseArticles(html, source);
    
    // Přidáme metadata
    const enrichedArticles = articles.map(article => ({
      ...article,
      destination: destination.name,
      domain: destination.domain,
      relevanceScore: this.scoreRelevance(article, destination.keywords),
      scrapedAt: new Date().toISOString()
    }));
    
    // Seřadíme podle relevance
    enrichedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`✅ Nalezeno ${enrichedArticles.length} článků z ${source.name}`);
    
    return enrichedArticles;
  }

  /**
   * Scrapuje všechny destinace
   */
  async scrapeAll() {
    console.log('🚀 Spouštím scraping pro všechny destinace...\n');
    
    this.results = [];
    
    for (const [key, destination] of Object.entries(destinations)) {
      console.log(`\n📍 Destinace: ${destination.name}`);
      console.log('─'.repeat(50));
      
      const destinationArticles = [];
      
      for (const source of destination.sources) {
        try {
          const articles = await this.scrapeSource(source, destination);
          destinationArticles.push(...articles);
        } catch (error) {
          console.error(`❌ Chyba při scrapování ${source.name}:`, error.message);
        }
      }
      
      this.results.push({
        destination: key,
        destinationName: destination.name,
        articles: destinationArticles,
        total: destinationArticles.length
      });
    }
    
    return this.results;
  }

  /**
   * Uloží výsledky do JSON souboru
   */
  async saveResults(filename = 'scraped-content.json') {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const dataDir = path.dirname(filePath);
    
    // Vytvoříme data složku, pokud neexistuje
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(filePath, JSON.stringify(this.results, null, 2), 'utf-8');
    console.log(`\n💾 Výsledky uloženy do: ${filePath}`);
    
    return filePath;
  }
}

// Spuštění, pokud je skript volán přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new ContentScraper();
  
  scraper.scrapeAll()
    .then(() => scraper.saveResults())
    .then(() => {
      console.log('\n✨ Scraping dokončen!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Chyba:', error);
      process.exit(1);
    });
}

export default ContentScraper;
