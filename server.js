const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoletable = require('console.table');
const db = require('./db/connection');

//use connection.js to connect to database
db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    startApp();
});

//app startup
const startApp = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Quit']
        }
    ])
    .then((answers) => {
        const { choices } = answers; 

        if (choices === 'View all departments') {
            viewDepartments();
        }

        if (choices === 'View all roles') {
            viewRoles();
        }

        if (choices === 'View all employees') {
            viewEmployees();
        }

        if (choices === 'Add a department') {
            addDepartment();
        }

        if (choices === 'Add a role') {
            addRole();
        }

        if (choices === 'Add an employee') {
            addEmployee();
        }

        if (choices === 'Update an employee role') {
            updateRole();
        }

        if (choices === 'Quit') {
            db.end();
        };
    });
};

//view department function
viewDepartments = () => {
    const sql = `SELECT departments.id AS id, departments.name AS departments FROM departments`; 
  
    db.query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      startApp();
    });
};

//view roles function
viewRoles = () => {
    const sql = `SELECT roles.id, 
    roles.title, 
    departments.name AS departments, 
    roles.salary
    FROM roles
    INNER JOIN departments ON roles.department_id = departments.id`;
  
    db.query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      startApp();
    });
};

//view employees function
viewEmployees = () => {
    const sql = `SELECT employees.id, 
    employees.first_name, 
    employees.last_name, 
    roles.title, 
    departments.name AS departments,
    roles.salary, 
    CONCAT (managers.first_name, " ", managers.last_name) AS managers
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees managers ON employees.manager_id = managers.id`;        
  
    db.query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      startApp();
    });
};

//add department function
addDepartment = () => {
    inquirer.prompt([
      {
        type: 'input', 
        name: 'addDepartment',
        message: "What is the name of the department?",
        validate: addDepartment => {
          if (addDepartment) {
              return true;
          } else {
              console.log('Please enter department name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
        const sql = `INSERT INTO departments (name)
                    VALUES (?)`;
        db.query(sql, answer.addDepartment, (err, result) => {
          if (err) throw err;
          console.log('Added ' + answer.addDepartment); 

          startApp();
      });
    });
  };

//add role function
addRole = () => {
    inquirer.prompt([
      {
        type: 'input', 
        name: 'addRole',
        message: "What is the name of the role?",
        validate: addRole => {
          if (addRole) {
              return true;
          } else {
              console.log('Please enter role name');
              return false;
          }
        }
      },
      {
        type: 'input', 
        name: 'addSalary',
        message: "What is the salary of the role?",
        validate: addSalary => {
          if (addSalary) {
              return true;
          } else {
              console.log('Please enter salary');
              return false;
          }
        }
      }
    ])
    .then(answer => {
        const params = [answer.addRole, answer.addSalary];
  
        //list departments to choose from
        const roleSql = `SELECT name, id FROM departments`; 
  
        db.query(roleSql, (err, data) => {
          if (err) throw err; 
      
          const department = data.map(({ name, id }) => ({ name: name, value: id }));
  
          inquirer.prompt([
          {
            type: 'list', 
            name: 'department',
            message: "What is the department of this role?",
            choices: department
          }
          ])
            .then(departmentChoice => {
              const department = departmentChoice.department;
              params.push(department);
  
              const sql = `INSERT INTO roles (title, salary, department_id)
                          VALUES (?, ?, ?)`;
  
              db.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log('Added' + answer.addRole); 
  
                startApp();
         });
       });
     });
   });
};

//add employee function
addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fist_name',
        message: "What is the employee's first name?",
        validate: addFirst => {
          if (addFirst) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'last_name',
        message: "What is the employee's last name?",
        validate: addLast => {
          if (addLast) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const params = [answer.fist_name, answer.last_name]
  
      //list roles
      const roleSql = `SELECT roles.id, roles.title FROM roles`;
    
      db.query(roleSql, (err, data) => {
        if (err) throw err; 
        
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
  
        inquirer.prompt([
              {
                type: 'list',
                name: 'roles',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(rolesChoice => {
                const roles = rolesChoice.roles;
                params.push(roles);
  
                const managerSql = `SELECT * FROM employees`;
  
                db.query(managerSql, (err, data) => {
                  if (err) throw err;
  
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
                  //list managers
  
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'managers',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managersChoice => {
                      const managers = managersChoice.managers;
                      params.push(managers);
  
                      const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
  
                      db.query(sql, params, (err, result) => {
                      if (err) throw err;
                      console.log("Employee has been added!")
  
                      startApp();
                });
              });
            });
          });
       });
    });
  };

//update employee role
updateRole = () => {
    //list employees
    const employeeSql = `SELECT * FROM employees`;
  
    db.query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
        .then(employeeChoice => {
          const employees = employeeChoice.name;
          const params = []; 
          params.push(employees);
  
          const roleSql = `SELECT * FROM roles`;
  
          db.query(roleSql, (err, data) => {
            if (err) throw err; 
  
            const roles = data.map(({ id, title }) => ({ name: title, value: id }));
            
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'role',
                  message: "What is the employee's new role?",
                  choices: roles
                }
              ])
                  .then(roleChoice => {
                  const roles = roleChoice.roles;
                  params.push(roles); 
                  
                  let employees = params[0]
                  params[0] = roles
                  params[1] = employees
                  
  
                  const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
  
                  db.query(sql, params, (err, result) => {
                    if (err) throw err;
                  console.log("Employee has been updated!");
                
                  startApp();
            });
          });
        });
      });
    });
  };