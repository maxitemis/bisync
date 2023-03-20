const DbConnection = require("../db-connection");
const dotenv = require('dotenv')
dotenv.config();

const openLegacyConnection = async function() {
    const legacyDbConnection = new DbConnection();
    await legacyDbConnection.open({
        user: process.env.LEGACY_DB_USERNAME,
        password: process.env.LEGACY_DB_PASSWORD,
        server: process.env.LEGACY_DB_SERVER,
        database: process.env.LEGACY_DB_DATABASE,
        trustServerCertificate: true
    });
    return legacyDbConnection;
}

const openModernizedConnection = async function() {
    const modernDbConnection = new DbConnection();
    await modernDbConnection.open({
        user: process.env.MODERNIZED_DB_USERNAME,
        password: process.env.MODERNIZED_DB_PASSWORD,
        server: process.env.MODERNIZED_DB_SERVER,
        database: process.env.MODERNIZED_DB_DATABASE,
        trustServerCertificate: true
    });
    return modernDbConnection;
}

module.exports = { openModernizedConnection, openLegacyConnection }
