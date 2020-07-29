USE employee_db;
-- SELECT * FROM employee;
-- SELECT * FROM employee WHERE manager_id IS NULL;
-- SELECT first_name, last_name FROM employee;
SELECT first_name, last_name, title
FROM employee
INNER JOIN role
on employee.role_id = role.id;
delete FROM employee_db.department WHERE id=5;