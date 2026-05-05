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

async function testSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/1NCUo0H5VG5xTR7gIEK4tOWzwwXyQdOb103hNmXplnCk/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const text = await fetch(url);
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonString);
    
    console.log(`\n=== SHEET: ${sheetName} ===`);
    console.log('COLUMNAS DETECTADAS:');
    console.log(data.table.cols.map((c, i) => `[${i}] ${c ? c.label : 'SIN TITULO'}`));
    
    console.log('\nPRIMERA FILA DE DATOS:');
    if (data.table.rows[0]) {
      console.log(data.table.rows[0].c.map((cell, i) => `Col ${i}: ${cell ? cell.v : 'null'}`));
    }
  } catch (e) {
    console.log(`No se pudo leer la hoja ${sheetName}`);
  }
}

async function run() {
  await testSheet('Respuestas de formulario 1');
  await testSheet('Puntarenas');
  await testSheet('Desamparados');
  await testSheet('Hoja 1');
  await testSheet('Sheet1');
}

run();
