const dotenv = require('dotenv')
dotenv.config();
const DbConnection = require('./src/db-connection');
const importModernDatabase = require('./src/import-modern-database');


async function main() {
    const legacyDbConnection = new DbConnection();
    await legacyDbConnection.open({
        user: process.env.LEGACY_DB_USERNAME,
        password: process.env.LEGACY_DB_PASSWORD,
        server: process.env.LEGACY_DB_SERVER,
        database: process.env.LEGACY_DB_DATABASE,
        trustServerCertificate: true
    });

    const modernDbConnection = new DbConnection();
    await modernDbConnection.open({
        user: process.env.MODERNIZED_DB_USERNAME,
        password: process.env.MODERNIZED_DB_PASSWORD,
        server: process.env.MODERNIZED_DB_SERVER,
        database: process.env.MODERNIZED_DB_DATABASE,
        trustServerCertificate: true
    })

    await importModernDatabase(legacyDbConnection, modernDbConnection);

    await modernDbConnection.close();
    await legacyDbConnection.close();
}

main();
