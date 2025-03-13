const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");
const fs = require("fs");
const { linkURLStatic } = require("../crawler-url"); // Importamos el array de URLs

const AxeCoreScript = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    let allViolations = [];

    for (const url of linkURLStatic) {
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: "networkidle2" });

        console.log(`🔍 Analizando accesibilidad en: ${url}`);

        const results = await new AxePuppeteer(page).analyze();
        
        // Filtrar solo las violaciones de contraste de color
        const colorContrastViolations = results.violations.filter(v => v.id === "color-contrast");

        allViolations.push({ url, violations: colorContrastViolations });
      } catch (error) {
        console.error(`⚠️ Error al cargar ${url}: ${error.message}`);
      } finally {
        await page.close();
      }
    }

    // Guardar el reporte en JSON
    const jsonFileName = "axe-report.json";
    fs.writeFileSync(jsonFileName, JSON.stringify(allViolations, null, 2));
    console.log(`✅ Reporte JSON guardado en ${jsonFileName}`);

    // Guardar el reporte en HTML
    const htmlFileName = "axe-report.html";
    const htmlContent = generateHTMLReport(allViolations);
    fs.writeFileSync(htmlFileName, htmlContent);
    console.log(`✅ Reporte HTML guardado en ${htmlFileName}`);

    await browser.close();
  } catch (error) {
    console.error("❌ Error al escanear las páginas:", error.message);
  } finally {
    process.exit(0);
  }
};

// Función para generar el reporte HTML
const generateHTMLReport = (allViolations) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Accesibilidad - Contraste de Color</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; background: #f4f4f4; }
            h1 { color: #333; }
            .violation { background: #fff; padding: 15px; margin-bottom: 20px; border-left: 5px solid red; }
            .impact { font-weight: bold; color: red; }
            .code { background: #eee; padding: 5px; font-family: monospace; }
            .no-violations { background: #d4edda; padding: 15px; border-left: 5px solid green; }
        </style>
    </head>
    <body>
        <h1>🔍 Reporte Consolidado de Accesibilidad</h1>
        
        ${allViolations
          .map(({ url, violations }) => `
          <h2>📌 URL: <a href="${url}" target="_blank">${url}</a></h2>
          ${
            violations.length === 0
              ? `
            <div class="no-violations">
                <h3>✅ No se encontraron problemas de contraste de color</h3>
            </div>
          `
              : `
            <p>Se encontraron <strong>${violations.length}</strong> problemas de contraste de color.</p>
            ${violations
              .map(v => `
              <div class="violation">
                  <h3>${v.id} - <span class="impact">${v.impact.toUpperCase()}</span></h3>
                  <p>${v.description}</p>
                  <p><strong>Solución:</strong> ${v.help}</p>
                  <p><a href="${v.helpUrl}" target="_blank">Más información</a></p>
                  ${v.nodes.map(node => `
                      <div>
                          <p><strong>Elemento afectado:</strong></p>
                          <p class="code">${node.html}</p>
                          <p><strong>Resumen:</strong> ${node.failureSummary}</p>
                      </div>
                  `).join("")}
              </div>
            `).join("")}
          `
          }
        `).join("")}
    </body>
    </html>
  `;
};

module.exports = { AxeCoreScript };
