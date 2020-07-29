var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employee_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  connection.query(
    "SELECT first_name, last_name, title FROM employee INNER JOIN role on employee.role_id = role.id;",
    function (err, res) {
      if (err) throw err;
      console.log(
        "----------------------------Query 1----------------------------"
      );
      console.log(res);
    }
  );

  // connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function(err, res) {
  //   if (err) throw err;
  //   console.log("----------------------------Query 2----------------------------");
  //   console.log(res);
  // });

  // // SELECT quantity
  // // FROM item
  // // GROUP BY quantity
  // // HAVING COUNT(item_code) >1

  // connection.query("SELECT * FROM employee WHERE manager_id=1", function(err, res) {
  //   if (err) throw err;
  //   console.log("----------------------------Query 3----------------------------");
  //   console.log(res);
  // });

  connection.end();
});
