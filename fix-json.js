const fs = require('fs');
const file = 'e:/Programming_Applications/Alpha-Clash-TCGArena/cards/alpha-clash-cards.json';
let content = fs.readFileSync(file, 'utf8');

try {
  JSON.parse(content);
  console.log('JSON is already valid');
} catch (e) {
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log('Error at position:', pos);
    console.log('Character at error:', JSON.stringify(content.substring(pos, pos + 20)));
    
    // Find the last valid closing brace before the error
    let lastValidBrace = content.lastIndexOf('}\n}', pos - 1);
    if (lastValidBrace > 0) {
      lastValidBrace += 3;
      content = content.substring(0, lastValidBrace);
      fs.writeFileSync(file, content);
      console.log('Trimmed file to position', lastValidBrace);
      
      try {
        JSON.parse(content);
        console.log('JSON is now valid!');
      } catch (e2) {
        console.log('Still invalid:', e2.message);
      }
    }
  }
}
