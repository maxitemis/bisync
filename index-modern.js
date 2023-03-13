const consume = require("./src/consumer-modern");
const { listRecords, connect } = require("./src/mssql-legacy-connection");
const { connectRedis, disconnectRedis } = require("./src/redis-client");

async function main() {
    try {
        await connectRedis()

        await connect();

        const records = await listRecords();
        console.log(records);

        await consume()

        // await disconnectRedis();
    } catch (err) {
        console.log(err);
    }
}

main();






