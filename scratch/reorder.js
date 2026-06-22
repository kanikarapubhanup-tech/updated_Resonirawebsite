const fs = require('fs');
const file = 'src/data/projects.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const index = data.findIndex(p => p.title === 'Job Kraves');
if (index > -1) {
  const [project] = data.splice(index, 1);
  data.unshift(project);
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
  console.log('Successfully moved Job Kraves to the front.');
} else {
  console.log('Job Kraves not found.');
}
