const http = require('http');
const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/employees',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('status', res.statusCode);
    try {
      const data = JSON.parse(body);
      console.log('count', Array.isArray(data) ? data.length : 'not-array');
      if (Array.isArray(data) && data.length > 0) {
        console.log('first', JSON.stringify(data[0], null, 2));
      }
    } catch (err) {
      console.error('parse error', err.message);
      console.error(body);
    }
  });
});

req.on('error', err => {
  console.error('request error', err.message);
});
req.end();
