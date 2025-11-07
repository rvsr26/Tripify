import { MongoClient } from 'mongodb';
import dns from 'dns';

dns.setServers(['8.8.8.8']); // Bypassing local DNS resolution issues

const SOURCE_URI = 'mongodb://127.0.0.1:27017';
const DEST_URI = 'mongodb+srv://dhhfciif_db_user:vishnu123@cluster0.0d4axa3.mongodb.net/tripify?retryWrites=true&w=majority';
const DB_NAME = 'tripify';

async function migrate() {
  // Use a longer timeout and explicit family if possible
  const sourceClient = new MongoClient(SOURCE_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  const destClient = new MongoClient(DEST_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 20000,
    // Try to force IPv4 if IPv6 is causing DNS issues
    family: 4
  });

  try {
    console.log('🔄 Connecting to Source (Local)...');
    await sourceClient.connect();
    console.log('✅ Connected to Source');

    console.log('🔄 Connecting to Destination (Atlas)...');
    await destClient.connect();
    console.log('✅ Connected to Destination');

    const sourceDb = sourceClient.db(DB_NAME);
    const destDb = destClient.db(DB_NAME);

    const collections = await sourceDb.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(n => !n.startsWith('system.'));

    console.log(`\nFound ${collectionNames.length} user collections: ${collectionNames.join(', ')}`);

    for (const name of collectionNames) {
      process.stdout.write(`Migrating ${name}... `);
      const sourceCol = sourceDb.collection(name);
      const destCol = destDb.collection(name);

      const docs = await sourceCol.find({}).toArray();
      if (docs.length === 0) {
        console.log('Skipped (Empty)');
        continue;
      }

      await destCol.deleteMany({}); // Start clean
      await destCol.insertMany(docs);
      console.log(`Done (${docs.length} docs)`);
    }

    console.log('\n🚀 ALL DATA COPIED TO ATLAS SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Migration Error Details:');
    console.error(err);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\nTIP: It looks like a connection or DNS error. Please ensure:');
      console.error('1. Your internet is connected (Ping google.com worked)');
      console.error('2. Your Atlas cluster IP Whitelist allows current IP (0.0.0.0/0 recommended for now)');
      console.error('3. The Atlas URI is correct.');
    }
  } finally {
    await sourceClient.close();
    await destClient.close();
  }
}

migrate();
