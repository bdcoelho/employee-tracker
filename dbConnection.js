var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
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

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: [
        "Add Departments, Roles or Employees",
        "View Departments, Roles or Employees",
        "Update Employee Roles",
        "EXIT",
      ],
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.task === "Add Departments, Roles or Employees") {
        addEntity();
      } else if (answer.task === "View Departments, Roles or Employees") {
        console.log(answer.task);
        // bidAuction();
      } else if (answer.task === "Update Employee Roles") {
        console.log(answer.task);
        // bidAuction();
      } else {
        connection.end();

      }
    });
}

function addEntity() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        type: "list",
        name: "entityAdd",
        message: "What would you like to add?",
        choices: ["Department", "Role", "Employee"],
      },

      {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
        when: function (answers) {
          return answers.entityAdd === "Department";
        },
      },

      {
        type: "input",
        name: "title",
        message: "What is the title of the role?",
        when: function (answers) {
          return answers.entityAdd === "Role";
        },
      },

      {
        type: "input",
        name: "salary",
        message: "What is the salary for this role?",
        when: function (answers) {
          return answers.entityAdd === "Role";
        },
      },
    ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info
      console.log(
        "-----------------------------Log 1-----------------------------"
      );
      console.log(answer);
      switch (answer.entityAdd) {
        case "Department":
          console.log(answer.department);
          connection.query(
            "INSERT INTO department SET ?",
            {
              name: answer.department,
            },
            function (err) {
              if (err) throw err;
              console.log("Department was added successfully!");
              // re-prompt the user for if they want to add/view others
              start();
            }
          );
          break;
        case "Role":
          console.log(answer.title);
          break;
        case "Employee":
          console.log("hello");
          break;
        default:
          return "Invalid case";
      }

      console.log("END");
    });
    connection.end();
  }
