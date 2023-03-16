const consume = require("./src/consumer-modern");
const { listLegacyRecords, connectLegacyDatabase } = require("./src/mssql-legacy-connection");
const { connectRedis } = require("./src/redis-client");
const dotenv = require('dotenv')
dotenv.config();


async function main() {
    try {
        await connectRedis()

        await connectLegacyDatabase({
            user: process.env.LEGACY_DB_USERNAME,
            password: process.env.LEGACY_DB_PASSWORD,
            server: process.env.LEGACY_DB_SERVER,
            database: process.env.LEGACY_DB_DATABASE,
            trustServerCertificate: true
        });

        const records = await listLegacyRecords();
        console.log(records);

        await consume()
        console.log('consumer reads modernized database changes');
        // await disconnectRedis();
    } catch (err) {
        console.log(err);
    }
}

main();






