// import the `Kafka` instance from the kafkajs library
const { Kafka } = require("kafkajs")
const {insertNewRecord, listRecords} = require("./mssql-connection");

// the client ID lets kafka know who's producing the messages
const clientId = "my-app"
// we can define the list of brokers in the cluster
const brokers = ["kafka:9092"]
// this is the topic to which we want to write messages
const topic = "server1.testDB.dbo.customers"

// initialize a new kafka client and initialize a producer from it
const kafka = new Kafka({ clientId, brokers })

const consumer = kafka.consumer({ groupId: clientId })

function handleRecord(value) {
    const json = "" + value;
    const parsed = JSON.parse(json);
    console.log("parsed payload:", parsed);
    console.log("operation:", parsed.payload.op);
    const operation = parsed.payload.op;
    if (operation == 'u') {
        console.log("update");
    } else if (operation == 'c') {
        console.log("insert");
        insertNewRecord(
            parsed.payload.after['first_name'],
            parsed.payload.after['last_name'],
            parsed.payload.after.email
        );
    } else if (operation == 'd') {
        console.log("delete");
    } else {
        console.log("unknown operation!!!");
    }

}

const consume = async () => {
    // first, we wait for the client to connect and subscribe to the given topic
    await consumer.connect()
    await consumer.subscribe({ topic })
    await consumer.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received message: ${message.value}`)

            handleRecord(message.value)

            //insertNewRecord("first name", "last name", "email27@email.com").then(err => {
            //    console.log(err)


            //    listRecords();

            //});
        },
    })
}

module.exports = consume
