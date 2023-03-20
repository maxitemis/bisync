const {connectModernDatabase, listModernRecords, closeModernDatabase} = require("./src/mssql-modern-connection");
const dotenv = require('dotenv')
const {closeLegacyDatabase} = require("./src/mssql-legacy-connection");
dotenv.config();

async function main() {
        await connectModernDatabase(
            {
                user: process.env.MODERNIZED_DB_USERNAME,
                password: process.env.MODERNIZED_DB_PASSWORD,
                server: process.env.MODERNIZED_DB_SERVER,
                database: process.env.MODERNIZED_DB_DATABASE,
                trustServerCertificate: false
            }
        );

        const records = await listModernRecords();
        console.log(records);

        await closeModernDatabase();
}

main();
