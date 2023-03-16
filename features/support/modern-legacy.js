const {When, Then, setDefaultTimeout} = require("@cucumber/cucumber");
const assert = require("assert");

const {
    connectLegacyDatabase,
    getLegacyRecord,
    closeLegacyDatabase
} = require("../../src/mssql-legacy-connection");
const {connectModernDatabase, getModernRecord, closeModernDatabase, updateRecord} = require("../../src/mssql-modern-connection");

const dotenv = require('dotenv')
dotenv.config();


setDefaultTimeout(60 * 1000);

let oldName, newName;

async function makeDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

When('name in modern database changed', async function () {

    await connectModernDatabase(
        {
            user: process.env.MODERNIZED_DB_USERNAME,
            password: process.env.MODERNIZED_DB_PASSWORD,
            server: process.env.MODERNIZED_DB_SERVER,
            database: process.env.MODERNIZED_DB_DATABASE,
            trustServerCertificate: true
        }
    );

    const records = await getModernRecord(1004);
    console.log(records.recordset[0]);
    const suffix = 1;
    oldName = records.recordset[0]['vorname'];
    newName = `${oldName}${suffix}`;

    await updateRecord(1004, newName, 'Kretchmar', 'annek@noanswer.org')

    await closeModernDatabase();
});


Then('name in legacy database also changes', async function () {
    await connectLegacyDatabase(
        {
            user: process.env.LEGACY_DB_USERNAME,
            password: process.env.LEGACY_DB_PASSWORD,
            server: process.env.LEGACY_DB_SERVER,
            database: process.env.LEGACY_DB_DATABASE,
            trustServerCertificate: true
        }
    );

    await makeDelay(16000);

    const records = await getLegacyRecord(1004);


    const newLegacyName = records.recordset[0]['first_name'];
    console.log("new record", records.recordset[0]);

    assert.equal(newName, newLegacyName)

    await closeLegacyDatabase();
});
