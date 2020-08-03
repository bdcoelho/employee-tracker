const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
let index = 0;

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
        viewEntities();
      } else if (answer.task === "Update Employee Roles") {
        // bidAuction();
      } else {
        connection.end();
      }
    });
}



function viewEntities() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        type: "list",
        name: "entityAdd",
        message: "What would you like to add?",
        choices: ["View all employees", "View all employees by department", "View all employees by manager"],
      },
    ])
    .then(function (answer) {
      // when finished prompting, insert a new item into the db with that info
      switch (answer.entityAdd) {
        case "View all employees":
          viewAll();
          break;
        case "View all employees by department":
          viewByDept();
          break;
        case "View all employees by manager":
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





function viewByDept() {
  connection.query(
    "SELECT * FROM employee_db.department;",
    (err, result) => {
      if (err) {
        throw err;
      }
      inquirer
        .prompt({
          name: "department",
          type: "list",
          message: "Please choose a department:",
          choices: result.map((department) => department.name),
        })
        .then((answer) => {
          const query = "SELECT id FROM department WHERE name = ?";
          connection.query(query, answer.department).then(function(err,res){
            console.log("1");
              console.log(err);

              console.log("2");
              console.log(res);


              if (err) throw err;
              const query =
                "SELECT emps.id, emps.first_name, emps.last_name, role.title AS Role, dept.name AS Department, role.salary AS Salary FROM department dept LEFT JOIN role ON role.department_id = dept.id LEFT JOIN employee emps ON emps.role_id = role.id WHERE emps.role_id = ANY (SELECT role.id FROM role WHERE role.department_id = ?)";
              const id = res.map((id) => id.id);
              console.log(id);
              connection.query(query, [id]).then(function(err,res){
                if (err) throw err;
                console.table(res);
                start();
              });
            







          });
        });
    }
  );
};


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

async function runQuery(table) {
  const [deptName] = await connection.execute("SELECT * FROM " + table);
  return deptName;
}

async function addRole() {
  var deptName = await runQuery("department");
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
  var roleTable = await runQuery("role");
  var employeeTable = await runQuery("employee");

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
        when: function (answers) {
          if (answers.roleNameSelection.includes("manager")){
          return false;
          };

        }
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
