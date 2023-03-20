const sql = require("mssql");

const getModernRecord = async (pool, id) => {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('select * from modern_customers where id = @id')
    const data = await ps.execute({id: id});
    await ps.unprepare();
    return data;
}

const updateModernRecord = async (pool, id, firstName, lastName, email) => {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE modern_customers SET vorname = @firstName, nachname = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})

    await ps.unprepare()
}

const updateLegacyRecord = async (pool, id, firstName, lastName, email) => {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE legacy_customers SET first_name = @firstName, last_name = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
    await ps.unprepare();
}

const getLegacyRecord = async (pool, id) => {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);

    await ps.prepare('select * from legacy_customers where id = @id')
    const data = await ps.execute({id: id});
    await ps.unprepare();
    return data;
}

const makeDelay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getModernRecord, updateModernRecord, updateLegacyRecord, getLegacyRecord, makeDelay }
