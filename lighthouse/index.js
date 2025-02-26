const puppeteer = require('puppeteer');
const fs = require('fs');

const { linkCrawlerHome } = require('../crawler-home');

const LighthouseScript = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const endpoint = browser.wsEndpoint();
    const port = new URL(endpoint).port;

    // Importación dinámica de Lighthouse
    const lighthouse = await import('lighthouse');

    for (const url of linkCrawlerHome) {
      console.log(`🔍 Analizando: ${url}`);

      const { lhr } = await lighthouse.default(url, {
        port,
        output: 'json'
      });

      // Guardar el reporte en un archivo JSON
      const fileName = `report-${url.replace(/https?:\/\//, '').replace(/\//g, '_')}.json`;
      fs.writeFileSync(fileName, JSON.stringify(lhr, null, 2));

      console.log(`✅ Reporte guardado: ${fileName}`);
    }

    await browser.close();
  } catch (error) {
    console.error("❌ Error al escanear la página:", error.message);
  } finally {
    process.exit(0); // Asegúrate de que el proceso se cierre
  }
};

module.exports = { LighthouseScript };
