import dns from 'dns/promises';

async function testDns() {
  dns.setServers(['8.8.8.8']);
  try {
    const addresses = await dns.resolveSrv('_mongodb._tcp.cluster0.0d4axa3.mongodb.net');
    console.log('✅ Resolved SRV:', addresses);
  } catch (err) {
    console.error('❌ Failed to resolve SRV with Google DNS:', err.message);
  }
}

testDns();
