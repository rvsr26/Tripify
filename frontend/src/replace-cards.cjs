const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

function replaceCards(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceCards(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const before = content;
      content = content.replace(/className="card"/g, 'className="glass-panel"');
      content = content.replace(/className="card /g, 'className="glass-panel ');
      
      if (content !== before) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated cards in ${file}`);
      }
    }
  }
}

replaceCards(pagesDir);
