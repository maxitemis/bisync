const dotenv = require('dotenv')
dotenv.config();

const startDualConsumers = require('./src/start-dual-consumers');
const {openLegacyConnection, openModernizedConnection} = require("./src/connection");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernizedConnection();

    await startDualConsumers(legacyDbConnection, modernDbConnection);

    // await modernDbConnection.close();
    // await legacyDbConnection.close();
}

main();
