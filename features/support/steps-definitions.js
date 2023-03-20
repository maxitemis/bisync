const assert = require('assert')
const { When, Then, setDefaultTimeout, BeforeAll, AfterAll} = require('@cucumber/cucumber')
const { openLegacyConnection, openModernizedConnection } = require("../../src/connection");
const { getModernRecord, updateModernRecord, updateLegacyRecord, getLegacyRecord, makeDelay } = require("../../src/helpers/feature-helpers");

setDefaultTimeout(60 * 1000);


When('name in modern database changed', async () => {
    const records = await getModernRecord(this.modernDbConnection.pool, 1004);
    const suffix = 1;
    this.oldName = records.recordset[0]['vorname'];
    this.newName = `${this.oldName}${suffix}`;
    console.log(records);
    await updateModernRecord(this.modernDbConnection.pool, 1004, this.newName, 'Kretchmar', 'annek@noanswer.org')
});

When('name in legacy database changed', async () => {
    const records = await getLegacyRecord(this.legacyDbConnection.pool, 1004);
    const suffix = 1;
    this.oldName = records.recordset[0]['first_name'];
    this.newName = `${this.oldName}${suffix}`;

    await updateLegacyRecord(this.legacyDbConnection.pool, 1004, this.newName, 'Kretchmar', 'annek@noanswer.org')
});

Then('name in legacy database also changes', async () => {
    console.log("start 5 seconds waiting");
    await makeDelay(5000);
    console.log("end 5 seconds waiting");

    const records = await getLegacyRecord(this.legacyDbConnection.pool, 1004);


    const newLegacyName = records.recordset[0]['first_name'];
    console.log("new record", records.recordset[0]);

    assert.equal(this.newName, newLegacyName)
});

Then('name in modernised database also changes', async () => {
    await makeDelay(5000);

    const records = await getModernRecord(this.modernDbConnection.pool, 1004);

    const newModernName = records.recordset[0]['vorname'];
    console.log("new record", records.recordset[0]);

    assert.equal(this.newName, newModernName)
});

BeforeAll(async () => {
    console.log('open database')
    this.legacyDbConnection = await openLegacyConnection();
    this.modernDbConnection = await openModernizedConnection();

    console.log('before legacy tests')
});


AfterAll(async () => {
    console.log('start close database');
    await this.legacyDbConnection.close();
    await this.modernDbConnection.close();

    console.log('after legacy tests');
});

