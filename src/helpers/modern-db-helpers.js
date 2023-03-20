const sql = require("mssql");

class ModernDbHelpers {
    pool

    constructor(pool) {
        this.pool = pool;
    }

    async getRecord (id) {
        const ps = new sql.PreparedStatement(this.pool);
        ps.input('id', sql.Int);

        await ps.prepare('select * from modern_customers where id = @id')
        const data = await ps.execute({id: id});
        await ps.unprepare();
        return data;
    }

    async getRecordByEmail (email) {
        const ps = new sql.PreparedStatement(this.pool);
        ps.input('email', sql.VarChar);

        await ps.prepare('select * from modern_customers where email = @email')
        const data = await ps.execute({email: email});
        await ps.unprepare();
        return data;
    }

    async updateRecord (id, firstName, lastName, email) {
        const ps = new sql.PreparedStatement(this.pool);
        ps.input('id', sql.Int);
        ps.input('firstName', sql.VarChar);
        ps.input('lastName', sql.VarChar);
        ps.input('email', sql.VarChar);

        await ps.prepare('UPDATE modern_customers SET vorname = @firstName, nachname = @lastName, email = @email where id = @id')
        await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})

        await ps.unprepare()
    }

    async close() {
        await this.pool.close();
    }

}

module.exports = ModernDbHelpers;
