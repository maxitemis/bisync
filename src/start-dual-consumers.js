const dotenv = require('dotenv')
const {Kafka} = require("kafkajs");
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


const startDualConsumers = async function (legacyConnection, modernConnection) {
    await consumerLegacy.connect()
    await consumerLegacy.subscribe({ topic: legacyTopic })
    await consumerLegacy.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received legacy message: ${message.value}`)
        },
    });

    await consumerModern.connect()
    await consumerModern.subscribe({ topic: modernTopic })
    await consumerModern.run({
        // this function is called every time the consumer gets a new message
        eachMessage: ({ message }) => {
            // here, we just log the message to the standard output
            console.log(`received modern message: ${message.value}`)
        },
    });
}


module.exports = startDualConsumers;
