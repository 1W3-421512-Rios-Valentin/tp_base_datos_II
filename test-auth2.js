const http = require('http');

const data = JSON.stringify({
  username: 'usuario' + Math.floor(Math.random() * 10000),
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', (chunk) => console.log('Data:', chunk.toString()));
  res.on('end', () => console.log('Done'));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();