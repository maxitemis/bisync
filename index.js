const consume = require("./src/consumer");
const { listRecords, connect } = require("./src/mssql-connection");
const { connectRedis, disconnectRedis } = require("./src/redis-client");

async function main() {
    try {
        await connectRedis()

        await connect();

        const records = await listRecords();
        console.log(records);

        await consume()

        console.log('consumer staterd');
        // await disconnectRedis();
    } catch (err) {
        console.log(err);
    }
}

main();






