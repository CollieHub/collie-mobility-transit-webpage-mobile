fetch('http://localhost:6002/transit/routes', { headers: { 'X-Application-ID': 'COLLIE-HEALTH-WEB', 'X-App-Signature': 'collie-transit-web-2026', 'X-App-Timestamp': Math.floor(Date.now()/1000).toString() } })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
