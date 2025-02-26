const dotenv = require("dotenv");
dotenv.config();
const { CrawlerScript } = require("./crawler");
const { LighthouseScript } = require("./lighthouse");
const { AxeCoreScript } = require("./axecore");

async function main() {
  try {
    // await CrawlerScript();
    // await LighthouseScript();
    await AxeCoreScript();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al escanear la página:", error.message);
  } finally {
    process.exit(0); // Asegúrate de que el proceso se cierre
  }
}

main();
