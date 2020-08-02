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
    ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info
      console.log(
        "-----------------------------Log 1-----------------------------"
      );
      console.log(answer);
      switch (answer.entityAdd) {
        case "Department":
          addDepartment();
          break;
        case "Role":
          addRole();
          break;
        case "Employee":
          addEmployee();
          break;
        default:
          return "Invalid case";
      }
    });
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;

    deptName = res.map(function (myObject) {
      return myObject.name;
    });

    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
        },

        {
          type: "input",
          name: "salary",
          message: "What is the salary for this role?",
        },

        {
          type: "list",
          name: "deptNameSelection",
          message: "What is the Department Name?",
          choices: deptName,
        },
      ])
      .then(function (answer) {
        const index = res.findIndex(function (dept, index) {
          return dept.name === answer.deptNameSelection;
        });
        console.log(index);
        deptIdSelection = res[index].id;
        console.log(deptIdSelection);

        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: deptIdSelection,
          },
          function (err) {
            if (err) throw err;
            console.log("Role was added successfully!");
            // re-prompt the user for if they want to add/view others
            start();
          }
        );

        console.log("END3");
      });
  });
}

function addDepartment() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
      },
    ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info

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

      console.log("END2");
    });
}

function addEmployee() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    roleName = res.map(function (myObject) {
      return myObject.title;
    });

    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the employee's first name?",
        },

        {
          type: "input",
          name: "lastName",
          message: "What is the employee's last name?",
        },

        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: roleName,
        },

        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: roleName,
        },
      ])
      .then(function (answer) {
        const index = res.findIndex(function (dept, index) {
          return dept.name === answer.deptNameSelection;
        });
        console.log(index);
        deptIdSelection = res[index].id;
        console.log(deptIdSelection);

        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: deptIdSelection,
          },
          function (err) {
            if (err) throw err;
            console.log("Role was added successfully!");
            // re-prompt the user for if they want to add/view others
            start();
          }
        );

        console.log("END4");
      });
  });
}






