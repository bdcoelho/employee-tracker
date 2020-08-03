const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
let index = 0;
let query = "";

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
        "View employees",
        "Update Employee Roles",
        "EXIT",
      ],
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.task === "Add Departments, Roles or Employees") {
        addEntity();
      } else if (answer.task === "View employees") {
        viewEntities();
      } else if (answer.task === "Update Employee Roles") {
        updateEmployeeRole();
      } else {
        connection.end();
      }
    });
}

async function updateEmployeeRole() {
  result = await connection.query(
    "SELECT DISTINCT concat(first_name,' ',last_name) AS Name, role.title FROM employee_db.employee LEFT JOIN role ON employee.role_id = role.id"
  );
  inquirer
    .prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee would you like to update?",
        choices: result[0].map((employee) => employee.Name),
      },
      {
        name: "role",
        type: "list",
        message: "What is the new role?",
        choices: result[0].map((role) => role.title),
      },
    ])
    .then(async function (answer) {
      const query =
        "UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ? ) WHERE id = (SELECT id FROM(SELECT id FROM employee WHERE CONCAT(first_name,' ',last_name) = ?) AS tmptable)";
      err = await connection.query(
        query,
        [answer.role, answer.employee]);
          console.log("Updated successfully!");
          start();
    });
}

function viewEntities() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        type: "list",
        name: "entityAdd",
        message: "What would you like to view?",
        choices: [
          "View all employees",
          "View employees by department",
          "View employees by manager",
        ],
      },
    ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info
      switch (answer.entityAdd) {
        case "View all employees":
          viewAll();
          break;
        case "View employees by department":
          viewByDept();
          break;
        case "View employees by manager":
          viewByManager();
          break;
        default:
          return "Invalid case";
      }
    });
}

function viewAll() {
  connection.query(
    "SELECT emps.id, emps.first_name, emps.last_name, role.title AS Role, dept.name AS Department, role.salary AS Salary, concat(mgrs.first_name, ' ', mgrs.last_name) AS Manager FROM employee emps LEFT JOIN employee mgrs ON emps.manager_id = mgrs.id LEFT JOIN role ON emps.role_id = role.id LEFT JOIN department dept ON role.department_id = dept.id;",
    function (err, result) {
      if (err) {
        throw err;
      } else {
        console.table(result);
      }

      start();
    }
  );
}

async function viewByDept() {
  result = await runQuery("SELECT * FROM department;");
  inquirer
    .prompt({
      name: "department",
      type: "list",
      message: "Please choose a department:",
      choices: result.map((department) => department.name),
    })
    .then(async function (answer) {
      query =
        "SELECT id FROM department WHERE name = '" + [answer.department] + "'";
      result = await runQuery(query);

      const id = result.map((id) => id.id);
      query =
        "SELECT emps.id, emps.first_name, emps.last_name, role.title AS Role, dept.name AS Department, role.salary AS Salary FROM department dept LEFT JOIN role ON role.department_id = dept.id LEFT JOIN employee emps ON emps.role_id = role.id WHERE emps.role_id = ANY (SELECT role.id FROM role WHERE role.department_id = '" +
        [id] +
        "')";
      res = await runQuery(query);
      console.table(res);
      start();
    });
}

async function viewByManager() {
  (query =
    "SELECT DISTINCT concat(mgrs.first_name, ' ', mgrs.last_name) AS Manager FROM employee emps LEFT JOIN employee mgrs ON emps.manager_id = mgrs.id WHERE concat(mgrs.first_name, ' ', mgrs.last_name) IS NOT NULL;"),
    (result = await runQuery(query));
  inquirer
    .prompt({
      name: "manager",
      type: "list",
      message: "Please choose a manager:",
      choices: result.map((manager) => manager.Manager),
    })
    .then(async function (answer) {
      query =
        "SELECT emps.id, emps.first_name, emps.last_name, role.title AS Role, dept.name AS Department, role.salary AS Salary, concat(mgrs.first_name, ' ', mgrs.last_name) AS Manager FROM department dept LEFT JOIN role ON role.department_id = dept.id LEFT JOIN employee emps ON emps.role_id = role.id LEFT JOIN employee mgrs ON emps.manager_id = mgrs.id WHERE concat(mgrs.first_name, ' ', mgrs.last_name) = '" +
        [answer.manager] +
        "';";
      result = await runQuery(query);
      console.table(result);
      start();
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

async function runQuery(query) {
  const [deptName] = await connection.execute(query);
  return deptName;
}

async function addRole() {
  var deptName = await runQuery("SELECT * FROM department");
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
  var roleTable = await runQuery("SELECT * FROM role");
  var employeeTable = await runQuery("SELECT * FROM employee");

  managerName = getManagerName(employeeTable);
  managerId = getManagerId(employeeTable);
  roleList = roleTable.map(function (myObject) {
    return myObject.title;
  });
  roleId = roleTable.map(function (myObject) {
    return myObject.id;
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
        name: "roleNameSelection",
        message: "What is the employee's role?",
        choices: roleList,
      },

      {
        type: "list",
        name: "managerNameSelection",
        message: "Who is the employee's manager?",
        choices: managerName,
        when: function (answer) {
          return !answer.roleNameSelection.includes("Manager");
        },
      },
    ])
    .then(function (answer) {
      index = managerName.findIndex(function (manager, index) {
        return manager === answer.managerNameSelection;
      });
      employeeManagerId = managerId[index];
      index = roleList.findIndex(function (role, index) {
        return role === answer.roleNameSelection;
      });
      employeeRoleId = roleId[index];
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
    });
}

const main = async () => {
  await startConnection();
  start();
};

main();
