const data = JSON.parse(require('fs').readFileSync('e:/Programming_Applications/Alpha-Clash-TCGArena/cards/alpha-clash-cards.json'));
const cards = ['AC2-T01', 'AC4-002', 'AC4-060', 'AC5-001', 'AC5-061'];
cards.forEach(id => {
  const card = data[id];
  const hasBack = card && card.face && card.face.back;
  console.log(id + ':', hasBack ? 'Has back face' : 'MISSING back face');
});
