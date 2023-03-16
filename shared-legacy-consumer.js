const consume = require("./src/consumer-legacy");
const { listModernRecords, connectModernDatabase } = require("./src/mssql-modern-connection");
const { connectRedis } = require("./src/redis-client");

async function main() {
    try {
        await connectRedis()

        await connectModernDatabase(
            {
                user: 'sa',
                password: 'Password!',
                server: 'sqlserver',
                database: 'newDB',
                trustServerCertificate: true
            }
        );

        const records = await listModernRecords();
        console.log(records);

        await consume()

        console.log('consumer reads legacy database changes');
        // await disconnectRedis();
    } catch (err) {
        console.log(err);
    }
}

main();






