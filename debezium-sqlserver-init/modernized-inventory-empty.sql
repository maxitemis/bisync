-- Create the test database
CREATE DATABASE newDB;
GO
USE newDB;
EXEC sys.sp_cdc_enable_db;

-- Create and populate our products using a single insert with many rows
CREATE TABLE modern_products (
                                 id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
                                 name VARCHAR(255) NOT NULL,
                                 description VARCHAR(512),
                                 weight FLOAT
);
EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_products', @role_name = NULL, @supports_net_changes = 0;
-- Create and populate the modern_products on hand using multiple inserts
CREATE TABLE modern_products_on_hand (
                                         product_id INTEGER NOT NULL PRIMARY KEY,
                                         quantity INTEGER NOT NULL,
                                         FOREIGN KEY (product_id) REFERENCES modern_products(id)
);
EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_products_on_hand', @role_name = NULL, @supports_net_changes = 0;
-- Create some modern_customers ...
CREATE TABLE modern_customers (
                                  id INTEGER IDENTITY(2001,1) NOT NULL PRIMARY KEY,
                                  vorname VARCHAR(255) NOT NULL,
                                  nachname VARCHAR(255) NOT NULL,
                                  email VARCHAR(255) NOT NULL UNIQUE
);
EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_customers', @role_name = NULL, @supports_net_changes = 0;
-- Create some very simple modern_orders
CREATE TABLE modern_orders (
                               id INTEGER IDENTITY(10001,1) NOT NULL PRIMARY KEY,
                               order_date DATE NOT NULL,
                               purchaser INTEGER NOT NULL,
                               quantity INTEGER NOT NULL,
                               product_id INTEGER NOT NULL,
                               FOREIGN KEY (purchaser) REFERENCES modern_customers(id),
                               FOREIGN KEY (product_id) REFERENCES modern_products(id)
);
EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_orders', @role_name = NULL, @supports_net_changes = 0;


CREATE TABLE synchronization (
                                 id INTEGER IDENTITY(101,1) NOT NULL PRIMARY KEY,
                                 object_name VARCHAR(255) NOT NULL,
                                 modernized_keys VARCHAR(512),
                                 legacy_keys VARCHAR(512),
                                 hash VARCHAR(512),
                                 version INTEGER NOT NULL
);

GO


