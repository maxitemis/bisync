const sql = require("mssql");

// config for your database
const config = {
    user: 'sa',
    password: 'Password!',
    server: 'sqlserver',
    database: 'testDB',
    trustServerCertificate: true
};

async function connect() {
    await sql.connect(config);
}

async function insertNewLegacyRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement();
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('SET IDENTITY_INSERT customers ON; INSERT INTO customers(id, first_name, last_name, email) VALUES (@id, @firstName, @lastName, @email)')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function updateLegacyRecord(id, firstName, lastName, email) {

    const ps = new sql.PreparedStatement();
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE customers SET first_name = @firstName, last_name = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function deleteLegacyRecord(id) {

    const ps = new sql.PreparedStatement();
    ps.input('id', sql.Int);

    await ps.prepare('DELETE FROM customers WHERE id = @id')
    await ps.execute({id: id})
}

async function listRecords() {
    const request = new sql.Request();
    // query to the database and get the records
    const records = await request.query('select * from customers');
    console.log(records);
}

module.exports = {
    listRecords, insertNewLegacyRecord, connect, updateLegacyRecord, deleteLegacyRecord
}
