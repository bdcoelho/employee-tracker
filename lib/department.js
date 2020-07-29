class Department {

    constructor(answer) {
      this.name = answer.department;
    }
  
    addDepEntity() {
        console.log(this.name);
              connection.query(
        "INSERT INTO department SET ?",
        {
            name: this.name,
        },

        function(err) {
          if (err) throw err;
          console.log("Your auction was created successfully!");

        }
      );
    }
  }
  
  module.exports = Department;
  