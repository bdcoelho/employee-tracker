class Employee {
    // Save a reference for `this` in `this` as `this` will change inside of inquirer
    constructor(answer) {
      this.firstName = answer.first_name;
      this.lastLame = answer.last_name;
      this.roleId = answer.role_id;
      this.managerId = answer.manager_id;

    }
  
    addEntity() {
      
              connection.query(
        "INSERT INTO auctions SET ?",
        {
            first_name: firstName,
            last_name: lastLame,
            role_id: roleId,
            manager_id: managerId
        },
        function(err) {
          if (err) throw err;
          console.log("Your auction was created successfully!");
          // re-prompt the user for if they want to bid or post
          start();
        }
      );


    }

  }
  
  module.exports = Employee;
  