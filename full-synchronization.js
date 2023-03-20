const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/import-modern-database');
const { openModernizedConnection, openLegacyConnection } = require("./src/connection");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernizedConnection();

    await importModernDatabase(legacyDbConnection, modernDbConnection);

    await modernDbConnection.close();
    await legacyDbConnection.close();
}

main();
