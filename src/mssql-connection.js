const sql = require("mssql");

// config for your database
const config = {
    user: 'sa',
    password: 'Password!',
    server: 'sqlserver',
    database: 'newDB',
    trustServerCertificate: true
};

async function connect() {
    await sql.connect(config);
}

async function insertNewRecord(firstName, lastName, email) {
    const ps = new sql.PreparedStatement();
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('INSERT INTO customers(vorname, nachname, email) VALUES (@firstName, @lastName, @email)')
    await ps.execute({firstName: firstName, lastName: lastName, email: email})
}

async function listRecords() {
    const request = new sql.Request();
    // query to the database and get the records
    const records = await request.query('select * from customers');
    console.log(records);
}

module.exports = {
    listRecords, insertNewRecord, connect
}
