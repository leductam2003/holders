const http = require('http');
const axios = require('axios');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/time') {
    try {
      const response = await axios.get("http://20.63.19.211/time", { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data); // Create a buffer from the response data
      res.writeHead(200, { 'Content-Type': 'image/png' }); // Set the appropriate content type
      res.end(imageBuffer); // Send the image buffer as the response
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
  console.log(`Server is running on http://localhost:${port}/holders`);
});
