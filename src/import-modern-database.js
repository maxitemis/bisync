const sql = require("mssql");

const importModernDatabase = async function (legacyConnection, modernConnection) {
    const request = new sql.Request(legacyConnection.pool);
    const records = await request.query('select * from legacy_customers');

    const ps = new sql.PreparedStatement(modernConnection.pool);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('INSERT INTO modern_customers(vorname, nachname, email) OUTPUT inserted.id VALUES (@firstName, @lastName, @email)')

    const psSynchronization = new sql.PreparedStatement(modernConnection.pool);
    psSynchronization.input('modernizedKeys', sql.VarChar);
    psSynchronization.input('legacyKeys', sql.VarChar);
    psSynchronization.input('hash', sql.VarChar);
    await psSynchronization.prepare('INSERT INTO synchronization(object_name, modernized_keys, legacy_keys, hash, version) ' +
        'VALUES (\'clients\', @modernizedKeys, @legacyKeys, @hash, 1)')



    for(const record of records.recordset) {
        console.log(record);

        const input = record['first_name'] + '&' + record['last_name'] + '&' + record['email'];
        const crypto = require('crypto')
        const hash = crypto.createHash('sha256').update(input).digest('hex');

        const result = await ps.execute({
            firstName: record['first_name'],
            lastName: record['last_name'],
            email: record['email']}
        )

        const insertedID = result.recordset[0]['id'];

        await psSynchronization.execute({
            modernizedKeys: "" + insertedID,
            legacyKeys: "" + record['id'],
            hash: hash
        })

        console.log(input, hash, insertedID);
    }

    await psSynchronization.unprepare();
    await ps.unprepare();
}

module.exports = importModernDatabase;
