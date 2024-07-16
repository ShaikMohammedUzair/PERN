// -- Create Customers Table
// CREATE TABLE Customers (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     email VARCHAR(100) UNIQUE NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- Create Products Table
// CREATE TABLE Products (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     price DECIMAL(10, 2) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- Create Sales Table
// CREATE TABLE Sales (
//     id SERIAL PRIMARY KEY,
//     customer_id INT REFERENCES Customers(id),
//     product_id INT REFERENCES Products(id),
//     quantity INT NOT NULL,
//     total_price DECIMAL(10, 2) NOT NULL,
//     sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );


const Pool = require("pg").Pool;
/*This line imports the Pool class from the pg module. The pg module is a PostgreSQL client for Node.js, and the Pool class is used to manage a pool of connections to the database.
*/
const pool = new Pool({
    user:"postgres",
    password:"12345678",
    host:"localhost",
    port:5432,
    database:"perntodo"
});

module.exports = pool;