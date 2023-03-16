const {connectModernDatabase, listModernRecords} = require("./src/mssql-modern-connection");
const dotenv = require('dotenv')
dotenv.config();

async function main() {
        await connectModernDatabase(
            {
                user: process.env.CLOUD_DB_USERNAME,
                password: process.env.CLOUD_DB_PASSWORD,
                server: process.env.CLOUD_DB_SERVER,
                database: process.env.CLOUD_DB_DATABASE,
                trustServerCertificate: false
            }
        );

        const records = await listModernRecords();
        console.log(records);
}

main();
