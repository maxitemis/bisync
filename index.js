const consume = require("./src/consumer")

var sql = require("mssql");

// config for your database
var config = {
    user: 'sa',
    password: 'Password!',
    server: 'sqlserver',
    database: 'myDB',
    trustServerCertificate: true
};

// connect to your database
sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    const ps = new sql.PreparedStatement();
    ps.input('firstName', sql.VarChar);
    ps.input('lastName', sql.VarChar);
    ps.input('email', sql.VarChar);

    ps.prepare('INSERT INTO customers(first_name, last_name, email) VALUES (@firstName, @lastName, @email)', err => {
        if (err) {
            console.log("can not prepare statement", err);
            return;
        }
        ps.execute({firstName: "firstName", lastName: "lastName", email: "email2@email.com"}, (err, result => {
            if (err) {
                console.log("can not insert record", err);
                return;
            }

            var request = new sql.Request();

            // query to the database and get the records
            request.query('select * from customers', function (err, recordset) {

                if (err) console.log(err)

                // send records as a response
                console.log(recordset);

                // start the consumer, and log any errors
                consume().catch((err) => {
                    console.error("error in consumer: ", err)
                })

            });
        }))
    })
});




