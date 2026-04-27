import fs from 'fs';

fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC_e3UFXxx57mHgbm4BkGC8Sy8f0y-SFag')
  .then(res => res.json())
  .then(data => fs.writeFileSync('models.json', JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
