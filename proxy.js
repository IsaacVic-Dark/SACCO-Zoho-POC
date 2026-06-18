const http = require('http');
const https = require('https');

const ZOHO_URL = 'https://flow.zoho.com/920894939/flow/webhook/incoming?zapikey=1001.1174157b612c2c28ebf7f19013a177bf.b28e71ca07ec0cb013d10efa1c627eaf&isdebug=false';

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(404); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const zoho = new URL(ZOHO_URL);
    const options = {
      hostname: zoho.hostname,
      path: zoho.pathname + zoho.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };

    const proxy = https.request(options, zohoRes => {
      let data = '';
      zohoRes.on('data', chunk => data += chunk);
      zohoRes.on('end', () => {
        res.writeHead(zohoRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });

    proxy.on('error', err => { res.writeHead(502); res.end(JSON.stringify({ error: err.message })); });
    proxy.write(body);
    proxy.end();
  });
}).listen(3001, () => console.log('Proxy running at http://localhost:3001'));