const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/random') {
    try {
      const imageDirectory = path.join(__dirname, 'images');
      const imageFiles = await fs.readdir(imageDirectory);
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      const imagePath = path.join(imageDirectory, randomImage);
      const imageBuffer = await fs.readFile(imagePath);
      const imageType = path.extname(randomImage).substring(1); // Remove the dot
      const sessionId = Math.random().toString(36).substring(2, 15);
      res.writeHead(200, {
        'Content-Type': `image/${imageType}`,
        'Set-Cookie': `session=${sessionId}; HttpOnly; Path=/; Max-Age=3600`,
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
  console.log(`Server is running on http://localhost:${port}`);
});
