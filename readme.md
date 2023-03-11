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
docker-compose exec kafka /kafka/bin/kafka-console-consumer.sh \
    --bootstrap-server kafka:9092 \
    --from-beginning \
    --property print.key=true \
    --topic server1.testDB.dbo.customers

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

# Shut down the cluster
docker-compose down
```

## Unidirectional Data Replication

````shell
# Initialize database and insert test data
cat debezium-sqlserver-init/new-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
````

## Manual Test 

```shell

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

# INSERT INTO customers(first_name,last_name,email) VALUES ('Roger','Poor','roger@poor.com');
# UPDATE customers set first_name = 'Barry' where id = 1005;
# DELETE FROM customers WHERE id = 5;
#
#

# run consumer
docker-compose exec node node /usr/src/app/index.js

```

## Mac M1

Example was teste on Mac M1 with the latest Docker version and activated amd64 emulation. 

## Todo

- [x] copy an example from debezium
  - [x] docker-compose and init script from repo 
- [ ] create a unidirectional prototype
  - [x] setup second database
  - [x] setup a [consumer](https://www.sohamkamani.com/nodejs/working-with-kafka/?utm_content=cmp-true)
    - [ ] solve problem connection to kafka from outside and inside of container 
      - [ ] allow consumer connection from outside?
      - [x] run consumer from inside docker-compose?
        - `docker run --rm -v $PWD:/usr/src/app node:19-alpine node index.js` 
      - [ ] change node js docker image 
  - [x] setup mssql connection
  - [ ] write logic to store changes
    - [ ] setup tests
    - [ ] store changes
- [ ] create a bidirectional prototype
  - [ ] create a redis database
  - [ ] setup domain model mapping
  - [ ] write transaction logs to redis
  - [ ] create a second connector

In this tutorial, you will always connect to Kafka from within a Docker container. 
Any of these containers can communicate with the kafka container by linking to it. If you needed to connect to Kafka from outside of a Docker container, you would have to set the -e option to advertise the Kafka address through the Docker host (-e ADVERTISED_HOST_NAME= followed by either the IP address or resolvable host name of the Docker host).
-e ADVERTISED_HOST_NAME=host.docker.internal
