# Prototype of Bidirectional Synchronization with External Redis Lock

## Using SQL Server

```shell
# Start the topology as defined in https://debezium.io/documentation/reference/stable/tutorial.html
export DEBEZIUM_VERSION=2.0


# Initialize database and insert test data

cat debezium-sqlserver-init/inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

# Start SQL Server connector
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json

# Consume messages from a Debezium topic
docker-compose exec kafka /kafka/bin/kafka-console-consumerLegacy.sh \
    --bootstrap-server kafka:9092 \
    --from-beginning \
    --property print.key=true \
    --topic server1.testDB.dbo.customers
    
    
docker-compose exec kafka /kafka/bin/kafka-console-consumerLegacy.sh \
    --bootstrap-server kafka:9092 \
    --from-beginning \
    --property print.key=true \
    --topic server2.newDB.dbo.customers

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

# Shut down the cluster
docker-compose down
```

## Unidirectional Data Replication

````shell
# Initialize database and insert test data
export DEBEZIUM_VERSION=2.0
cat debezium-sqlserver-init/inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
cat debezium-sqlserver-init/new-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver-new.json

curl -i -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/

````

## Manual Test 

```shell

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

# INSERT INTO customers(first_name,last_name,email) VALUES ('Roger','Poor','roger1@poor.com');
# UPDATE customers set first_name = 'Barry' where id = 1005;
# DELETE FROM customers WHERE id = 5;
#
#

# run consumerLegacy
docker-compose exec node node /usr/src/app/shared-legacy-consumerLegacy.js

docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

```

## Mac M1

Example was teste on Mac M1 with the latest Docker version and activated amd64 emulation. 

## Start Naive Prototype

````shell
docker-compose exec node node shared-modern-consumer.js
docker-compose exec node node shared-legacy-consumer.js
````

## Tests

````shell
docker-compose exec node npm test 
````



## Todo

- [x] copy an example from debezium
  - [x] docker-compose and init script from repo 
- [ ] create a unidirectional prototype
  - [x] setup second database
  - [x] setup a [consumerLegacy](https://www.sohamkamani.com/nodejs/working-with-kafka/?utm_content=cmp-true)
    - [x] solve problem connection to kafka from outside and inside of container 
      - [ ] allow consumerLegacy connection from outside?
      - [x] run consumerLegacy from inside docker-compose?
        - `docker run --rm -v $PWD:/usr/src/app node:19-alpine node shared-legacy-consumer-legacy.js` 
      - [ ] change node js docker image 
  - [x] setup mssql connection
  - [ ] write logic to store changes
    - [x] use promises
    - [ ] store changes
      - [x] insert
      - [ ] setup primary key table
      - [x] setup key forcing
      - [x] update
      - [x] delete
    - [ ] setup tests
- [x] create a bidirectional prototype
  - [x] register another debezium connection 
  - [x] create a redis database
  - [x] connect to redis database
  - [x] write transaction logs to redis
  - [x] test the solution
  - [x] create a second consumerLegacy
  - [ ] setup domain model mapping
  - [x] create a second connector

### Idea with one data model different databases

- each change creates a new object
- each object has version

- [x] create a model for the new and the old database
- [x] create a table to store mappings

### 
 - [x] use .env file
 - [x] rename tables
 - [x] kafka topic to .env file
 - [ ] avoid code duplication
 - [ ] make a new prototype with a table

VM?
 - [ ] init database for tests

 - [ ] better testing
 - [ ] two keys table idea

`````mermaid
sequenceDiagram
    participant Legacysystem
    participant LegacyTopic 
    participant Modernsystem
    participant ModernTopic
    Legacysystem->>LegacyTopic: Änderung veröffentlicht
    Legacysystem->>LegacyTopic: Änderung veröffentlicht
    LegacyTopic->>Modernsystem: Altdatenänderung auf das neue System angewendet
    Modernsystem-->>ModernTopic: Shatten Änderung veröffentlicht
    Modernsystem->>ModernTopic: Änderung veröffentlicht
    ModernTopic->>Legacysystem: Neue Datenänderung, die auf das Altsystem angewendet wurde
    Legacysystem-->>LegacyTopic: Shatten Änderung veröffentlicht
`````


Problems:
Cycle dependencies in databank

how I can know the new ID?
