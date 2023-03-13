const consume = require("./src/consumer");
const {listRecords, insertNewRecord, connect} = require("./src/mssql-connection");

async function main() {
    try {
        await connect();

        await insertNewRecord("first name", "last name", "email25@email.com");

        const recors = await listRecords();
        console.log(recors);

        await consume()
    } catch (err) {
        console.log(err);
    }
}

main();






