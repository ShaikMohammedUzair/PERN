//const pool=require("./db");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db'); // Import the pool from db.js

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Routes


// insertData();


app.get('/customers', async (req, res) => {
    try {
        const customers = await pool.query("SELECT * FROM Customers");
        res.json(customers.rows);
        console.log(customers.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/customers/sorted', async (req, res) => {
    try {
        const customers = await pool.query(`
            SELECT Customers.id, Customers.name, COUNT(Sales.product_id) as products_bought
            FROM Customers
            JOIN Sales ON Customers.id = Sales.customer_id
            GROUP BY Customers.id, Customers.name
            ORDER BY products_bought DESC
        `);
        res.json(customers.rows);
        console.log(customers.rows);
    } catch (err) {
        console.error(err.message);
    }
});



app.post('/customers', async (req, res) => {
    try {
        const { name, email } = req.body;
        const newCustomer = await pool.query(
            "INSERT INTO Customers (name, email) VALUES ($1, $2) RETURNING *",
            [name, email]
        );
        res.json(newCustomer.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.put('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        await pool.query(
            "UPDATE Customers SET name = $1, email = $2 WHERE id = $3",
            [name, email, id]
        );
        res.json("Customer updated successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.delete('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM Customers WHERE id = $1", [id]);
        res.json("Customer deleted successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await pool.query("SELECT * FROM Products");
        res.json(products.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, price } = req.body;
        const newProduct = await pool.query(
            "INSERT INTO Products (name, price) VALUES ($1, $2) RETURNING *",
            [name, price]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`Attempting to delete sales for customer with id: ${id}`);
        
        // Manually delete related records in the Sales table first
        const deleteSalesResult = await pool.query('DELETE FROM Sales WHERE customer_id = $1', [id]);
        console.log(`Deleted sales rows: ${deleteSalesResult.rowCount}`);
        
        // Then delete the customer record
        const deleteCustomerResult = await pool.query('DELETE FROM Customers WHERE id = $1', [id]);
        console.log(`Deleted customer rows: ${deleteCustomerResult.rowCount}`);
        
        if (deleteCustomerResult.rowCount === 0) {
            res.status(404).json({ message: 'Customer not found' });
        } else {
            res.json({ message: 'Customer deleted successfully' });
        }
    } catch (err) {
        console.error(`Error deleting customer with id ${id}:`, err.message);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});



app.get('/products/sales/combine', async (req, res) => {
    console.log("inside");
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.name,
          SUM(s.quantity) AS total_quantity_sold
        FROM 
          products p
        JOIN 
          sales s ON p.id = s.product_id
        GROUP BY 
          p.id, p.name
        ORDER BY 
          p.name;
      `);
  
      res.status(200).json(result.rows);
      console.log(result.rows);
    } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        await pool.query(
            "UPDATE Products SET name = $1, price = $2 WHERE id = $3",
            [name, price, id]
        );
        res.json("Product updated successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM Products WHERE id = $1", [id]);
        res.json("Product deleted successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.post('/sales', async (req, res) => {
    try {
        const { customer_id, product_id, quantity, total_price, sale_date } = req.body;
        const newSale = await pool.query(
            "INSERT INTO Sales (customer_id, product_id, quantity, total_price, sale_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [customer_id, product_id, quantity, total_price, sale_date]
        );
        res.json(newSale.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.put('/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_id, product_id, quantity, total_price, sale_date } = req.body;
        await pool.query(
            "UPDATE Sales SET customer_id = $1, product_id = $2, quantity = $3, total_price = $4, sale_date = $5 WHERE id = $6",
            [customer_id, product_id, quantity, total_price, sale_date, id]
        );
        res.json("Sale updated successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.delete('/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM Sales WHERE id = $1", [id]);
        res.json("Sale deleted successfully");
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT Sales.*, Customers.name as customer_name, Products.name as product_name
            FROM Sales
            JOIN Customers ON Sales.customer_id = Customers.id
            JOIN Products ON Sales.product_id = Products.id
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/customers', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT Customers.name as customer_name, SUM(Sales.total_price) as total_spent
            FROM Sales
            JOIN Customers ON Sales.customer_id = Customers.id
            GROUP BY Customers.name
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/products', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT Products.name as product_name, SUM(Sales.total_price) as total_earned
            FROM Sales
            JOIN Products ON Sales.product_id = Products.id
            GROUP BY Products.name
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/weekly', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT * FROM Sales
            WHERE sale_date >= date_trunc('week', CURRENT_DATE)
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/monthly', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT * FROM Sales
            WHERE sale_date >= date_trunc('month', CURRENT_DATE)
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/yearly', async (req, res) => {
    try {
        const sales = await pool.query(`
            SELECT * FROM Sales
            WHERE sale_date >= date_trunc('year', CURRENT_DATE)
        `);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/sales/range', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const sales = await pool.query(`
            SELECT * FROM Sales
            WHERE sale_date BETWEEN $1 AND $2
        `, [new Date(startDate), new Date(endDate)]);
        res.json(sales.rows);
        console.log(sales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
