const assert = require('assert')
const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber')
const { connectLegacyDatabase, updateLegacyRecord, getLegacyRecord, closeLegacyDatabase} = require("../../src/mssql-legacy-connection");
const { connectModernDatabase, getModernRecord, closeModernDatabase} = require("../../src/mssql-modern-connection");

let oldName, newName;

setDefaultTimeout(60 * 1000);

When('name in legacy database changed', async function () {

    await connectLegacyDatabase(
        {
            user: 'sa',
            password: 'Password!',
            server: 'sqlserver',
            database: 'testDB',
            trustServerCertificate: true
        }
    );

    const records = await getLegacyRecord(1004);
    console.log(records.recordset[0]);
    const suffix = 1;
    oldName = records.recordset[0]['first_name'];
    newName = `${oldName}${suffix}`;

    await updateLegacyRecord(1004, newName, 'Kretchmar', 'annek@noanswer.org')

    await closeLegacyDatabase();

});



async function makeDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Then('name in modernised database also changes', async function () {
    await connectModernDatabase(
        {
            user: 'sa',
            password: 'Password!',
            server: 'sqlserver',
            database: 'newDB',
            trustServerCertificate: true
        }
    );

    await makeDelay(6000);

    const records = await getModernRecord(1004);



    const newModernName = records.recordset[0]['vorname'];
    console.log("new record", records.recordset[0]);

    assert.equal(newName, newModernName)

    await closeModernDatabase();
});

