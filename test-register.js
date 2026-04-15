const http = require('http');

const data = JSON.stringify({
  username: 'newuser' + Date.now(),
  email: 'new' + Date.now() + '@test.com',
  password: 'pass123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();