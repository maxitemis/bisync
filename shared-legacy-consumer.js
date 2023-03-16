const consume = require("./src/consumer-legacy");
const { listModernRecords, connectModernDatabase } = require("./src/mssql-modern-connection");
const { connectRedis } = require("./src/redis-client");
const dotenv = require('dotenv')
dotenv.config();


async function main() {
    try {
        await connectRedis()

        await connectModernDatabase(
            {
                user: process.env.MODERNIZED_DB_USERNAME,
                password: process.env.MODERNIZED_DB_PASSWORD,
                server: process.env.MODERNIZED_DB_SERVER,
                database: process.env.MODERNIZED_DB_DATABASE,
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






