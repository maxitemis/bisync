const sql = require("mssql");

class SynchronizationRepository {
    pool

    constructor(pool) {
        this.pool = pool;
    }

    async getMappingByLegacyId(legacyKey) {
        const ps = new sql.PreparedStatement(this.pool);
        ps.input('id', sql.VarChar);

        await ps.prepare('select * from synchronization where legacy_keys = @id')
        const data = await ps.execute({id: "" + legacyKey});
        await ps.unprepare();
        return data.recordset[0];
    }

    async getMappingByModernizedId(modernizedKey) {
        const ps = new sql.PreparedStatement(this.pool);
        ps.input('id', sql.VarChar);

        await ps.prepare('select * from synchronization where modernized_keys = @id')
        const data = await ps.execute({id: "" + modernizedKey});
        await ps.unprepare();
        return data.recordset[0];
    }
}

module.exports = SynchronizationRepository;
