const consume = require("./src/consumer-modern");
const { listLegacyRecords, connectLegacyDatabase } = require("./src/mssql-legacy-connection");
const { connectRedis } = require("./src/redis-client");

async function main() {
    try {
        await connectRedis()

        await connectLegacyDatabase({
            user: 'sa',
            password: 'Password!',
            server: 'sqlserver',
            database: 'testDB',
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






