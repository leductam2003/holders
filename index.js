const http = require('http');
const fs = require('fs').promises;
const { createCanvas } = require('canvas');
const https = require('https');

async function getIPAddress() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ip = JSON.parse(data).ip;
        resolve(ip);
      });
    }).on('error', (err) => reject(err));
  });
}
async function generateImage() {
  const formattedDate = new Date().toUTCString();
  const ip = await getIPAddress()

  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // Large Time Text
  ctx.font = '150px VT323';
  ctx.fillStyle = '#f5a991';
  ctx.textAlign = 'center';
  ctx.fillText("$IP", width / 2, 200);

  // Smaller Date Text
  ctx.font = '70px VT323';
  ctx.fillStyle = '#00FF00';
  ctx.fillText(ip, width / 2, 400);

  // Return buffer
  return canvas.toBuffer('image/png');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/ip') {
    try {
      const imageBuffer = await generateImage();

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      });
      res.end(imageBuffer);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/ip`);
});
