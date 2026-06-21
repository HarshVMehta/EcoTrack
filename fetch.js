const https = require('https');
const fs = require('fs');

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAzM2I3NmM3NWM5MTQzZTdhNTc3NzZhYjIxZTc2YzllEgsSBxC0-ZyhoxAYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTU5MDM4OTE2Mzc2Njg4OTMyOQ&filename=&opi=89354086";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('dashboard.html', data);
    console.log('Downloaded dashboard HTML, size:', data.length);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
