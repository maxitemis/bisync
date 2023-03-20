const dotenv = require('dotenv')
const {Kafka} = require("kafkajs");
const crypto = require("crypto");
const sql = require("mssql");
dotenv.config();

// the client ID lets kafka know who's producing the messages
const clientId = "my-app";
const brokers = ["kafka:9092"];
const legacyTopic =  process.env.LEGASY_TOPIC_NAME;
const modernTopic =  process.env.MODERNIZED_TOPIC_NAME;
const kafka = new Kafka({ clientId, brokers });

const kafka2 = new Kafka({ clientId: "my-app-2", brokers });

const consumerLegacy = kafka.consumer({ groupId: clientId });


const consumerModern = kafka2.consumer({ groupId: "my-app-2" });


async function handleModernRecordUpdate(legacyPool, modernizedPool, value) {
    const json = "" + value;
    const parsed = JSON.parse(json);
    console.log("parsed payload:", parsed);
    if (!parsed) {
        console.log("warning, can not parse payload");
        return;
    }

    const operation = parsed.payload.op;
    if (operation === 'u') {
        console.log("update");
        const mapping = await getMappingByModernizedId(modernizedPool, parsed.payload.after['id']);
        const input = parsed.payload.after['vorname'] + '&' + parsed.payload.after['nachname'] + '&' + parsed.payload.after['email'];
        const crypto = require('crypto')
        const newHash = crypto.createHash('sha256').update(input).digest('hex');
        console.log('modernized hashes: ', newHash, mapping.hash)
        if (newHash === mapping.hash) {
            // records are the same no need to update
            console.log('only records hash is the same for modernd record, no changes are needed')
            return;
        }
        await updateLegacyRecord(
            legacyPool,
            Number.parseInt(mapping['legacy_keys']),
            parsed.payload.after['vorname'],
            parsed.payload.after['nachname'],
            parsed.payload.after['email']
        )
        await updateHashForEntry(modernizedPool, mapping.id, newHash);

        return;
    }
    console.log('only update is supported')

}

async function updateLegacyRecord(pool, id, firstName, lastName, email) {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE legacy_customers SET first_name = @firstName, last_name = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function updateModernRecord(pool, id, firstName, lastName, email) {
    const ps = new sql.PreparedStatement(pool);
    ps.input('id', sql.Int);
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    await ps.prepare('UPDATE modern_customers SET vorname = @firstName, nachname = @lastName, email = @email where id = @id')
    await ps.execute({id: id, firstName: firstName, lastName: lastName, email: email})
}

async function getMappingByLegacyId(modernizedPool, legacyKey) {
    const ps = new sql.PreparedStatement(modernizedPool);
    ps.input('id', sql.VarChar);

    await ps.prepare('select * from synchronization where legacy_keys = @id')
    const data = await ps.execute({id: "" + legacyKey});
    await ps.unprepare();
    return data.recordset[0];
}

async function getMappingByModernizedId(modernizedPool, modernizedKey) {
    const ps = new sql.PreparedStatement(modernizedPool);
    ps.input('id', sql.VarChar);

    await ps.prepare('select * from synchronization where modernized_keys = @id')
    const data = await ps.execute({id: "" + modernizedKey});
    await ps.unprepare();
    return data.recordset[0];
}

async function updateHashForEntry(modernizedPool, id, newHash) {
    const psSynchronization = new sql.PreparedStatement(modernizedPool);
    psSynchronization.input('id', sql.Int);
    psSynchronization.input('hash', sql.VarChar);
    await psSynchronization.prepare(
        'UPDATE synchronization SET hash = @hash, version = version + 1 WHERE id = @id'
    );

    await psSynchronization.execute({
        id: id,
        hash: newHash
    })

    await psSynchronization.unprepare();
}

async function handleLegacyRecordUpdate(pool, value) {
    const json = "" + value;
    const parsed = JSON.parse(json);
    console.log("parsed payload:", parsed);
    if (!parsed) {
        console.log("warning, can not parse payload");
        return;
    }

    const operation = parsed.payload.op;
    if (operation === 'u') {
        console.log("update");
        const mapping = await getMappingByLegacyId(pool, parsed.payload.after['id']);
        const input = parsed.payload.after['first_name'] + '&' + parsed.payload.after['last_name'] + '&' + parsed.payload.after['email'];
        const crypto = require('crypto')
        const newHash = crypto.createHash('sha256').update(input).digest('hex');
        console.log('legasy hashes: ', newHash, mapping.hash)
        if (newHash === mapping.hash) {
            // records are the same no need to update
            console.log('only records hash is the same for legacy record, no changes are needed')
            return;
        }
        await updateModernRecord(
            pool,
            Number.parseInt(mapping['modernized_keys']),
            parsed.payload.after['first_name'],
            parsed.payload.after['last_name'],
            parsed.payload.after['email']
        )
        await updateHashForEntry(pool, mapping.id, newHash);
        return;
    }
    console.log('only update is supported')
}

const startDualConsumers = async function (legacyConnection, modernConnection) {
    await consumerLegacy.connect()
    await consumerLegacy.subscribe({ topic: legacyTopic })
    await consumerLegacy.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received legacy message: ${message.value}`)
            handleLegacyRecordUpdate(modernConnection.pool, message.value)
        },
    });

    await consumerModern.connect()
    await consumerModern.subscribe({ topic: modernTopic })
    await consumerModern.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received modern message: ${message.value}`)
            handleModernRecordUpdate(legacyConnection.pool, modernConnection.pool, message.value)
        },
    });
}


module.exports = startDualConsumers;
