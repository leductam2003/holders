const http = require('http');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp'); // Add sharp library
registerFont('./Balonku-Regular.ttf', { family: 'Balonku' });

async function findHolders(tokenAddress) {
  let page = 1;
  const allOwners = new Set();
  while (true) {
    const payload = {
      jsonrpc: "2.0",
      method: "getTokenAccounts",
      id: "helius-test",
      params: {
        page: page,
        limit: 1000,
        displayOptions: {},
        mint: tokenAddress
      }
    };

    try {
      const response = await axios.post('https://mainnet.helius-rpc.com/?api-key=298da113-724f-45fa-a2c3-7616a2eaba88', payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = response.data;

      if (!data.result || !data.result.token_accounts || data.result.token_accounts.length === 0) {
        console.log(`No more results. Total pages: ${page - 1}`);
        break;
      }

      console.log(`Processing results from page ${page}`);

      data.result.token_accounts.forEach(account => {
        allOwners.add(account.owner);
      });

      page += 1;
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      break;
    }
  }
  return Array.from(allOwners);
}

async function generateHolderImage(mint) {
  const holders = await findHolders(mint);
  const holderCount = holders.length.toString();
  const width = 500;
  const height = 500;

  // Create an image using sharp
  const image = await sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 } // Black background
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${width}" height="${height}">
          <text x="50%" y="200" font-family="Balonku" font-size="60" fill="#f5a991" text-anchor="middle">HOLDER</text>
          <text x="50%" y="400" font-family="Balonku" font-size="100" fill="#00FF00" text-anchor="middle">${holderCount}</text>
        </svg>
      `),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync(`./holder.png`, image);
  return image;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/holders') {
    try {
      const imageBuffer = await generateHolderImage("0")
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
  console.log(`Server is running on http://localhost:${port}`);
});
