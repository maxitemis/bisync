const assert = require('assert')
const { When, Then, setDefaultTimeout, BeforeAll, AfterAll} = require('@cucumber/cucumber')
const { openLegacyConnection, openModernizedConnection } = require("../../src/connection");
const LegacyDbHelpers = require("../../src/helpers/legacy-db-helpers");
const ModernDbHelpers = require("../../src/helpers/modern-db-helpers");
const { makeDelay } = require("../../src/helpers/feature-helpers");

setDefaultTimeout(60 * 1000);

async function waitValueForChange(callback, oldValue, maxtimeout) {
    const startTime = Date.now();
    let newTime;
    let newValue;
    do {
        newValue = await callback();
        newTime = Date.now();
        if (newValue !== oldValue) {
            return newValue;
        }
        await makeDelay(1000);
    } while (newTime - startTime < maxtimeout)

    return newValue;
}


When('name in legacy database changed', async () => {
    const records = await this.legacyDbHelpers.getRecordByEmail("annek@noanswer.org");
    const suffix = 1;
    this.oldName = records.recordset[0]['first_name'];
    this.newName = `${this.oldName}${suffix}`;
    await this.legacyDbHelpers.updateRecord(records.recordset[0]['id'], this.newName, 'Kretchmar', 'annek@noanswer.org')
});

When('name in modern database changed', async () => {
    const records = await this.modernDbHelpers.getRecordByEmail("annek@noanswer.org");
    const suffix = 1;
    this.oldName = records.recordset[0]['vorname'];
    this.newName = `${this.oldName}${suffix}`;
    await this.modernDbHelpers.updateRecord(records.recordset[0]['id'], this.newName, 'Kretchmar', 'annek@noanswer.org')
});

Then('name in modernised database also changes', async () => {
    const newModernName = await waitValueForChange(async () => {
        const records = await this.modernDbHelpers.getRecordByEmail("annek@noanswer.org");
        return  records.recordset[0]['vorname']
    }, this.oldName, 10000);

    assert.equal(newModernName, this.newName);
});

Then('name in legacy database also changes', async () => {
    const newLegacyName = await waitValueForChange(async () => {
        const records = await this.legacyDbHelpers.getRecordByEmail("annek@noanswer.org");
        return records.recordset[0]['first_name'];
    }, this.oldName, 10000)
    assert.equal(newLegacyName, this.newName)
});


BeforeAll(async () => {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernizedConnection();

    this.legacyDbHelpers = new LegacyDbHelpers(legacyDbConnection.pool);
    this.modernDbHelpers = new ModernDbHelpers(modernDbConnection.pool);
});


AfterAll(async () => {
    await this.legacyDbHelpers.close();
    await this.modernDbHelpers.close();
});

