const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const util = require("util");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const writeFileAsync = util.promisify(fs.writeFile);




// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

// function to prompt the user with a series of questions to gather data for the file being created
function promptUser() {
  return inquirer.prompt([


    {
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: ["Add Departments, Roles or Employees", "View Departments, Roles or Employees", "Update Employee Roles"]
    },

    {
      type: "list",
      name: "entityAdd",
      message: "What would you like to add?",
      choices: ["Department", "Role", "Employee"],
      when: function (answers) {
        return answers.task === "Add Departments, Roles or Employees";
      }
      },

      {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
        when: function (answers) {
          return answers.entityAdd === "Department";
        }
        },

      {
        type: "input",
        name: "role",
        message: "What is the name of the role?",
        when: function (answers) {
          return answers.entityAdd === "Role";
        }
        },



      {
        type: "input",
        name: "employee",
        message: "What is the name of the employee?",
        when: function (answers) {
          return answers.entityAdd === "Employee";
        }
        },



        {
          type: "list",
          name: "updateEmployeeRole",
          message: "Which employee's role would you like to update?",
          choices: ["Bob", "Frank", "Ben"],
          when: function (answers) {
            return answers.task === "Update Employee Roles";
          }
          },

  ]);
};



async function init() {
    try {
      // init function pauses whilst gathering user data through the promptUser function and stores the data in "answers"
      answers = await promptUser();
      console.log(answers)
      // notifies the user if successful
      console.log("Successful");
    } catch (err) {
      // notifies the user if there was an error
      console.log(err);
    }
}

init();
