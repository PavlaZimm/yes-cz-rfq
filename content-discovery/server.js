import express from 'express';
import ContentScraper from './scraper/scraper.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint pro získání všech témat
app.get('/api/topics', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'scraped-content.json');
    
    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      const results = JSON.parse(data);
      
      // Filtrujeme podle relevance (minimální skóre)
      const minRelevance = parseInt(req.query.minRelevance) || 1;
      const filteredResults = results.map(dest => ({
        ...dest,
        articles: dest.articles.filter(a => a.relevanceScore >= minRelevance)
      }));
      
      res.json({
        success: true,
        data: filteredResults,
        lastUpdated: (await fs.stat(dataPath)).mtime.toISOString()
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          data: [],
          message: 'Zatím nejsou žádná data. Spusťte scraping.'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Chyba při načítání témat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint pro získání témat pro konkrétní destinaci
app.get('/api/topics/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const dataPath = path.join(__dirname, 'data', 'scraped-content.json');
    
    const data = await fs.readFile(dataPath, 'utf-8');
    const results = JSON.parse(data);
    
    const destinationData = results.find(r => r.destination === destination);
    
    if (!destinationData) {
      return res.status(404).json({
        success: false,
        error: 'Destinace nenalezena'
      });
    }
    
    const minRelevance = parseInt(req.query.minRelevance) || 1;
    const filteredArticles = destinationData.articles.filter(a => a.relevanceScore >= minRelevance);
    
    res.json({
      success: true,
      data: {
        ...destinationData,
        articles: filteredArticles
      }
    });
  } catch (error) {
    console.error('Chyba při načítání témat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint pro spuštění scrapingu
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('🔄 Spouštím scraping na požádání...');
    
    const scraper = new ContentScraper();
    const results = await scraper.scrapeAll();
    await scraper.saveResults();
    
    res.json({
      success: true,
      message: 'Scraping dokončen',
      data: results,
      totalArticles: results.reduce((sum, r) => sum + r.total, 0)
    });
  } catch (error) {
    console.error('Chyba při scrapování:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Automatický scraping každý den v 6:00
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Automatický scraping spuštěn...');
  try {
    const scraper = new ContentScraper();
    await scraper.scrapeAll();
    await scraper.saveResults();
    console.log('✅ Automatický scraping dokončen');
  } catch (error) {
    console.error('❌ Chyba při automatickém scrapování:', error);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Content Discovery Server běží na http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/topics`);
  console.log(`🔍 Spuštění scrapingu: POST http://localhost:${PORT}/api/scrape`);
});
