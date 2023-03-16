const sql = require("mssql");

let pool;

async function connectModernDatabase(config) {
    const appPool = new sql.ConnectionPool(config);
    pool = await appPool.connect();
}

async function closeModernDatabase() {
    pool.close();
}

async function insertNewRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('SET IDENTITY_INSERT modern_customers ON; INSERT INTO modern_customers(id, vorname, nachname, email) VALUES (@id, @firstName, @lastName, @email)')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function updateRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE modern_customers SET vorname = @firstName, nachname = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function deleteRecord(id) {

    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('DELETE FROM modern_customers WHERE id = @id')
    await ps.execute({id: id})
}

async function getModernRecord(id) {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('select * from modern_customers where id = @id')
    const data = await ps.execute({id: id});
    await ps.unprepare();
    return data;
}

async function listModernRecords() {
    const request = new sql.Request(pool);
    return request.query('select * from modern_customers');
}

module.exports = {
    closeModernDatabase, getModernRecord, listModernRecords, insertNewRecord, connectModernDatabase, updateRecord, deleteRecord
}
