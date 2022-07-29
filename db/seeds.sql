INSERT INTO departments (name)
VALUES 
('Engineering'),
('Human Resources'),
('RND'),
('Cheese Taster');

INSERT INTO roles (title, salary, department_id)
VALUES
('Software Engineer', 120000, 1),
('Electrical Engineer', 100000, 1), 
('Recruitment', 30000, 2),
('Analyst', 70000, 2), 
('Lab Management', 90000, 3),
('Cheese Expert', 1500000, 4);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
('Dug', 'Dimmadome', 2, null),
('Timmy', 'Turner', 1, 1),
('Jimmy', 'Neutron', 4, null),
('Ronald', 'McDonald', 3, 3),
('Hannah', 'Montana', 6, null),
('Shia', 'LeBouf', 5, 5),
('Kim', 'Possible', 2, null),
('Jojo', 'Bizarre', 3, 7);
