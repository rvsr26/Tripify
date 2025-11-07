import mongoose from 'mongoose';

async function findPrimary() {
    const hosts = ['00-00', '00-01', '00-02'];
    const user = 'dhhfciif_db_user';
    const pass = 'vishnu123';
    const cluster = '0d4axa3';

    for (const h of hosts) {
        const uri = `mongodb://${user}:${pass}@ac-zx88sps-shard-${h}.${cluster}.mongodb.net:27017/admin?ssl=true&authSource=admin&directConnection=true`;
        try {
            console.log(`Checking Shard ${h}...`);
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
            console.log(`Shard ${h} is ${isMaster.ismaster ? 'PRIMARY' : 'SECONDARY'}`);
            await mongoose.disconnect();
            if (isMaster.ismaster) {
                console.log(`Found Primary: Shard ${h}`);
                process.exit(0);
            }
        } catch (err) {
            console.log(`Shard ${h} failed: ${err.message}`);
        }
    }
    console.log('No primary found via direct connection.');
    process.exit(1);
}

findPrimary();
