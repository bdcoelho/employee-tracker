const mysql = require("mysql2/promise");
const bluebird = require('bluebird');

const main = async () => {
    const connection =  await mysql.createConnection({
        host: "localhost",
      
        // Your port; if not 3306
        port: 3306,
      
        // Your username
        user: "root",
      
        // Your password
        password: "",
        database: "employee_db",
        Promise: bluebird,
    });

    const [rows] = await connection.execute("SELECT * FROM department");
    console.log(rows);
};

main();