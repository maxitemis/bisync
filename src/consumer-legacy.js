// import the `Kafka` instance from the kafkajs library
const { Kafka } = require("kafkajs")
const {insertNewRecord, updateRecord, listModernRecords, deleteRecord} = require("./mssql-modern-connection");
const {createKey, isKeySet, deleteKey} = require("./redis-client");

const dotenv = require('dotenv')
dotenv.config();

// the client ID lets kafka know who's producing the messages
const clientId = "my-app"
// we can define the list of brokers in the cluster
const brokers = ["kafka:9092"]
// this is the topic to which we want to write messages
const topic =  process.env.LEGASY_TOPIC_NAME

// initialize a new kafka client and initialize a producer from it
const kafka = new Kafka({ clientId, brokers })

const consumerLegacy = kafka.consumer({ groupId: clientId })

async function causedBySyncProcess(id) {
    if (await isKeySet(`newDBKey: ${id}`)) {
        console.log("changes is caused by other consumer, stop here");
        await deleteKey(`newDBKey: ${id}`)
        return true;
    }
    console.log("changes is caused by application");
    await createKey(`oldDBKey: ${id}`, "something")
    return false;
}

async function applyForTestDb(parsed) {
    console.log("operation:", parsed.payload.op);
    const operation = parsed.payload.op;
    if (operation === 'u') {
        console.log("update");
        if (await causedBySyncProcess(parsed.payload.after['id'])) {
            return;
        }
        await updateRecord(
            parsed.payload.after['id'],
            parsed.payload.after['first_name'],
            parsed.payload.after['last_name'],
            parsed.payload.after.email
        )
    } else if (operation === 'c') {
        console.log("insert");
        if (await causedBySyncProcess(parsed.payload.after['id'])) {
            return;
        }
        await insertNewRecord(
            parsed.payload.after['id'],
            parsed.payload.after['first_name'],
            parsed.payload.after['last_name'],
            parsed.payload.after.email
        );
    } else if (operation === 'd') {
        console.log("delete");
        if (await causedBySyncProcess(parsed.payload.before['id'])) {
            return;
        }
        await deleteRecord(parsed.payload.before['id'])
    } else {
        console.log("unknown operation!!!");
    }
}

async function handleRecord(value) {
    const json = "" + value;
    const parsed = JSON.parse(json);
    console.log("parsed payload:", parsed);
    if (!parsed) {
        console.log("warning, can not parse payload");
    } else {
        await applyForTestDb(parsed);
    }

}

const consume = async () => {
    // first, we wait for the client to connect and subscribe to the given topic
    await consumerLegacy.connect()
    await consumerLegacy.subscribe({ topic })
    await consumerLegacy.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received message: ${message.value}`)

            handleRecord(message.value)
        },
    })
}

module.exports = consume
