const sql = require("mssql");

let pool;

async function connectLegacyDatabase(config) {
    const appPool = new sql.ConnectionPool(config);
    pool = await appPool.connect();
}

async function closeLegacyDatabase() {
    await pool.close();
}

async function insertNewLegacyRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('SET IDENTITY_INSERT legacy_customers ON; INSERT INTO legacy_customers(id, first_name, last_name, email) VALUES (@id, @firstName, @lastName, @email)')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function updateLegacyRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE legacy_customers SET first_name = @firstName, last_name = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function deleteLegacyRecord(id) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('DELETE FROM legacy_customers WHERE id = @id')
    await ps.execute({id: id})
}

async function getLegacyRecord(id) {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('select * from legacy_customers where id = @id')
    const data = await ps.execute({id: id});
    await ps.unprepare();
    return data;
}

async function listRecords() {
    const request = new sql.Request(pool);
    const records = await request.query('select * from legacy_customers');
}

module.exports = {
    closeLegacyDatabase, getLegacyRecord, listLegacyRecords: listRecords, insertNewLegacyRecord, connectLegacyDatabase, updateLegacyRecord, deleteLegacyRecord
}
