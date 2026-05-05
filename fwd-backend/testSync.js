const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testSheet() {
  const url = "https://docs.google.com/spreadsheets/d/14q2Z3569zs6ZfBNmTzcXRSam7Ew8surXSUODCevkOMQ/gviz/tq?tqx=out:json&sheet=Puntarenas";
  const text = await fetch(url);
  const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const data = JSON.parse(jsonString);
  
  console.log('COLUMNAS DETECTADAS:');
  console.log(data.table.cols.map((c, i) => `[${i}] ${c.label || 'SIN TITULO'}`));
  
  console.log('\nPRIMERA FILA DE DATOS:');
  if (data.table.rows[0]) {
    console.log(data.table.rows[0].c.map((cell, i) => `Col ${i}: ${cell ? cell.v : 'null'}`));
  }
}

testSheet();
