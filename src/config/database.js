const mysql = require("mysql2/promise");
require("dotenv").config();

console.log('Database Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection error:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    throw error;
  }
};

createConnection()
  .then(conn => {
    console.log('Initial connection test successful');
    conn.end();
  })
  .catch(err => {
    console.error('Initial connection test failed:', err);
  });

module.exports = createConnection;