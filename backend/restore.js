import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function restore() {
    const uri = process.argv[2];
    const backupDir = process.argv[3];

    if (!uri || !backupDir) {
        console.error('Usage: node restore.js <mongodb-uri> <backup-directory>');
        process.exit(1);
    }

    if (!fs.existsSync(backupDir)) {
        console.error(`Error: Backup directory "${backupDir}" not found.`);
        process.exit(1);
    }

    try {
        console.log(`Connecting to: ${uri.replace(/\/\/.*@/, '//****:****@')}`);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection.db;
        const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));

        console.log(`Found ${files.length} backup files in "${backupDir}". Starting restore...`);

        for (const file of files) {
            const collectionName = path.basename(file, '.json');
            const filePath = path.join(backupDir, file);
            
            console.log(`Restoring: ${collectionName}...`);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Clean restore: drop collection first
            try {
                await db.dropCollection(collectionName);
                console.log(`Dropped existing collection: ${collectionName}`);
            } catch (dropErr) {
                // Collection might not exist, ignore
            }

            if (data.length === 0) {
                await db.createCollection(collectionName);
                console.log(`Created empty collection: ${collectionName}`);
                continue;
            }

            await db.collection(collectionName).insertMany(data);
            console.log(`Successfully restored ${data.length} documents into ${collectionName}`);
        }

        console.log('Restore completed successfully.');
    } catch (err) {
        console.error('Restore failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

restore();
