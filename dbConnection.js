const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
let index=0;

// create the connection information for the sql database
let connection;

const startConnection = async () => {
  connection = await mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "employee_db",
  });
};

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
        // bidAuction();
      } else if (answer.task === "Update Employee Roles") {
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

async function runQuery(table) {
  console.log("SELECT * FROM " + table);
  const [deptName] = await connection.execute("SELECT * FROM " + table);
  return deptName;
}

async function addRole() {
  var deptName = await runQuery("department");
  console.log(deptName);
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
      index = deptName.findIndex(function (dept) {
        return dept.name === answer.deptNameSelection;
      });
      deptIdSelection = deptName[index].id;
      console.log(deptIdSelection);

      connection
        .query("INSERT INTO role SET ?", {
          title: answer.title,
          salary: answer.salary,
          department_id: deptIdSelection,
        })
        .then(function () {
          console.log("Role was added successfully");
          start();
        });

      console.log("END3");
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

      connection
        .query("INSERT INTO department SET ?", {
          name: answer.department,
        })
        .then(function () {
          console.log("Department was added successfully");
          start();
        });

      console.log("END2");
    });
}

function getManagerId(employeeTable) {
  const managerList = employeeTable.filter(
    (employee) => employee.manager_id == null
  );

  const managerId = managerList.map(function (myObject) {
    return myObject.id;
  });
  return managerId;
}

function getManagerName(employeeTable) {
  const managerList = employeeTable.filter(
    (employee) => employee.manager_id == null
  );
  const managerFirstName = managerList.map(function (myObject) {
    return myObject.first_name;
  });
  const managerLastName = managerList.map(function (myObject) {
    return myObject.last_name;
  });
  const managerName = managerFirstName.map(function (firstName, i) {
    return firstName + " " + String(managerLastName[i]);
  });

  return managerName;
}

async function addEmployee() {
  var roleTable = await runQuery("role");
  var employeeTable = await runQuery("employee");

  console.log("look here");
  managerName = getManagerName(employeeTable);
  console.log(managerName);
  managerId = getManagerId(employeeTable);
  console.log(managerId);
  roleList = roleTable.map(function (myObject) {
    return myObject.title;
  });
  roleId = roleTable.map(function (myObject) {
    return myObject.id;
  });
console.log("The role id is "+ roleId)



  console.log(roleList)

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
        name: "roleNameSelection",
        message: "What is the employee's role?",
        choices: roleList,
      },

      {
        type: "list",
        name: "managerNameSelection",
        message: "Who is the employee's manager?",
        choices: managerName,
      },
    ])
    .then(function (answer) {
      index = managerName.findIndex(function (manager, index) {
        return manager === answer.managerNameSelection;
      });
      employeeManagerId=managerId[index]
      index = roleList.findIndex(function (role, index) {
        return role === answer.roleNameSelection;
      });
      employeeRoleId=roleId[index];
      connection
        .query("INSERT INTO employee SET ?", {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: employeeRoleId,
          manager_id: employeeManagerId,
        })
        .then(function () {
          console.log("Employee was added successfully");
          start();
        });

      console.log("END3");
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

      connection
        .query("INSERT INTO department SET ?", {
          name: answer.department,
        })
        .then(function () {
          console.log("Department was added successfully");
          start();
        });

      console.log("END2");
    });
}

const main = async () => {
  await startConnection();
  start();
};

main();
