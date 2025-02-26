const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const fs = require('fs');

const url = process.env.URL_INFOBAE || "https://www.infobae.com"; // URL por defecto si no está en env

const AxeCoreScript = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log(`🔍 Analizando accesibilidad en: ${url}`);

    const results = await new AxePuppeteer(page).analyze();
    
    // Filtrar solo las violaciones de contraste de color
    const colorContrastViolations = results.violations.filter(v => v.id === "color-contrast");

    // Guardar en JSON
    const jsonFileName = "axe-report.json";
    fs.writeFileSync(jsonFileName, JSON.stringify(colorContrastViolations, null, 2));
    console.log(`✅ Reporte JSON guardado en ${jsonFileName}`);

    // Generar reporte en HTML
    const htmlFileName = "axe-report.html";
    const htmlContent = generateHTMLReport(url, colorContrastViolations);
    fs.writeFileSync(htmlFileName, htmlContent);
    console.log(`✅ Reporte HTML guardado en ${htmlFileName}`);

    await browser.close();
    return results; // Devolvemos el JSON completo, aunque solo guardamos las violaciones de color contrast
  } catch (error) {
    console.error("❌ Error al escanear la página:", error.message);
  } finally {
    process.exit(0); // Cierra el proceso después de ejecutar el script
  }
};

// Función para generar el HTML con los resultados de color contrast
const generateHTMLReport = (url, violations) => {
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
        <h1>🔍 Reporte de Accesibilidad para: ${url}</h1>
        
        ${violations.length === 0 ? `
          <div class="no-violations">
              <h2>✅ No se encontraron problemas de contraste de color</h2>
          </div>
        ` : `
          <p>Se encontraron <strong>${violations.length}</strong> problemas de contraste de color.</p>
          ${violations.map(v => `
            <div class="violation">
                <h2>${v.id} - <span class="impact">${v.impact.toUpperCase()}</span></h2>
                <p>${v.description}</p>
                <p><strong>Solución:</strong> ${v.help}</p>
                <p><a href="${v.helpUrl}" target="_blank">Más información</a></p>
                ${v.nodes.map(node => `
                    <div>
                        <p><strong>Elemento afectado:</strong></p>
                        <p class="code">${node.html}</p>
                        <p><strong>Resumen:</strong> ${node.failureSummary}</p>
                    </div>
                `).join('')}
            </div>
          `).join('')}
        `}
    </body>
    </html>
  `;
};

module.exports = { AxeCoreScript };
