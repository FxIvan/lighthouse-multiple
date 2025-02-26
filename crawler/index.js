const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const url = process.env.URL_INFOBAE || "https://www.infobae.com"; // URL por defecto si no se encuentra en env

const CrawlerScript = async () => {
  try {
    console.log("🕷️ Escaneando la página:", url);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = new Set(); // Usamos un Set para evitar duplicados

    $("a").each((_, el) => {
      let href = $(el).attr("href");

      if (href && href.startsWith("/")) {
        href = new URL(href, url).href; // Convierte en URL absoluta
        links.add(href);
      }
    });

    const linksArray = Array.from(links); // Convertimos el Set en un Array

    // Guardar en un JSON
    fs.writeFileSync("crawler-video.json", JSON.stringify(linksArray, null, 2));
    console.log("✅ Rutas encontradas guardadas en crawler.json");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al escanear la página:", error.message);
  } finally {
    process.exit(0); // Asegúrate de que el proceso se cierre
  }
};

module.exports = { CrawlerScript };
