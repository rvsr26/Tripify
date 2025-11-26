import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function backup() {
    const uri = process.argv[2];
    const outDir = process.argv[3] || './backup';

    if (!uri) {
        console.error('Usage: node backup.js <mongodb-uri> [output-directory]');
        process.exit(1);
    }

    try {
        console.log(`Connecting to: ${uri.replace(/\/\/.*@/, '//****:****@')}`);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection.db;
        try {
            const admin = db.admin();
            const dbs = await admin.listDatabases({ readPreference: 'secondaryPreferred' });
            console.log('Available databases:', dbs.databases.map(d => d.name).join(', '));
        } catch (adminErr) {
            console.warn('Warning: Could not list databases (may be restricted on this node).');
        }

        const collections = await db.listCollections({}, { readPreference: 'secondaryPreferred' }).toArray();

        if (collections.length === 0) {
            console.warn(`Warning: No collections found in database "${mongoose.connection.name}".`);
            console.log('Please check if the database name in your URI is correct.');
            return;
        }

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        console.log(`Found ${collections.length} collections in "${mongoose.connection.name}". Starting backup...`);

        for (const colInfo of collections) {
            const collectionName = colInfo.name;
            console.log(`Exporting: ${collectionName}...`);
            
            const data = await db.collection(collectionName).find({}, { readPreference: 'secondaryPreferred' }).toArray();
            const filePath = path.join(outDir, `${collectionName}.json`);
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Saved ${data.length} documents to ${filePath}`);
        }

        console.log('Backup completed successfully.');
    } catch (err) {
        console.error('Backup failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

backup();

// Build verification patch on 11/26/2025, 9:38:00 AM
