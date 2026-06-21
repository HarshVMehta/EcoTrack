const https = require('https');
const fs = require('fs');
const path = require('path');

const jsonPath = 'C:/Users/harsh/.gemini/antigravity-ide/brain/53bf24f5-98c3-4796-ac6d-2961fcc49b93/.system_generated/steps/12/output.txt';

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const outDir = path.join(__dirname, 'stitch-screens');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  data.screens.forEach(screen => {
    const title = screen.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const url = screen.htmlCode.downloadUrl;
    const dest = path.join(outDir, `${title}.html`);
    
    https.get(url, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        fs.writeFileSync(dest, html);
        console.log(`Downloaded ${title}.html`);
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${title}:`, err.message);
    });
  });
} catch (e) {
  console.error(e);
}
