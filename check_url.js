const https = require('https');
https.get('https://feedback-portal-lac.vercel.app/assets/index-Dl7NGB5p.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec/);
    console.log("Found URL:", match ? match[0] : "None");
  });
});
