const fs = require('fs');
const file = 'src/data/projects.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

// First, rename "Job Kraves" to "Kraves"
const kravesIndex = data.findIndex(p => p.title === 'Job Kraves' || p.title === 'Kraves');
if (kravesIndex > -1) {
  data[kravesIndex].title = 'Kraves';
  if (data[kravesIndex].client === 'Job Kraves') {
     data[kravesIndex].client = 'Kraves';
  }
}

// Target order
const targetOrder = [
  'Kraves', 
  'Swetha SaiPhani Clinic HMS', 
  'Palle News'
];

const items = [];
for (const title of targetOrder) {
  const idx = data.findIndex(p => p.title === title);
  if (idx > -1) {
    items.push(data.splice(idx, 1)[0]);
  } else {
    console.log(`Could not find ${title}`);
  }
}

// If we found them, prepend them
if (items.length > 0) {
  data = [...items, ...data];
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
  console.log('Reordered and renamed successfully.');
}
