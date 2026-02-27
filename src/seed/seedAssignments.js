require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const baseTemplates = [
  {
    title: 'Select All Employees',
    description: 'Write a query to retrieve all records from the `employees` table.',
    difficulty: 'easy',
    topic: 'SELECT Basics',
    points: 10,
    expectedQuery: 'SELECT * FROM employees;',
  },
  {
    title: 'Filter with WHERE',
    description: 'Find all employees in the `Engineering` department.',
    difficulty: 'easy',
    topic: 'WHERE Filtering',
    points: 10,
    expectedQuery: "SELECT * FROM employees WHERE department = 'Engineering';",
  },
  {
    title: 'Sort Results with ORDER BY',
    description: 'Retrieve all employees sorted by salary in descending order.',
    difficulty: 'easy',
    topic: 'ORDER BY',
    points: 10,
    expectedQuery: 'SELECT * FROM employees ORDER BY salary DESC;',
  },
  {
    title: 'Count Records with COUNT',
    description: 'Count the total number of employees in the `employees` table.',
    difficulty: 'easy',
    topic: 'Aggregates',
    points: 15,
    expectedQuery: 'SELECT COUNT(*) FROM employees;',
  },
  {
    title: 'Group By Department',
    description: 'Find the number of employees in each department.',
    difficulty: 'medium',
    topic: 'GROUP BY',
    points: 20,
    expectedQuery: 'SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department;',
  },
  {
    title: 'Average Salary by Department',
    description: 'Calculate the average salary for each department. Show only departments where the average salary is greater than 65000.',
    difficulty: 'medium',
    topic: 'GROUP BY / HAVING',
    points: 25,
    expectedQuery: 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department HAVING AVG(salary) > 65000;',
  },
  {
    title: 'JOIN Two Tables',
    description: "Retrieve each employee's name along with the name of their project.",
    difficulty: 'medium',
    topic: 'JOINs',
    points: 25,
    expectedQuery: 'SELECT employees.name, projects.project_name FROM employees JOIN projects ON employees.id = projects.employee_id;',
  },
  {
    title: 'Subquery — High Earners',
    description: 'Find all employees whose salary is above the average salary of all employees.',
    difficulty: 'hard',
    topic: 'Subqueries',
    points: 30,
    expectedQuery: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
  },
  {
    title: 'Complex JOIN with Aggregation',
    description: 'For each department, find the total salary budget and the number of projects assigned to employees in that department.',
    difficulty: 'hard',
    topic: 'Complex Queries',
    points: 40,
    expectedQuery: 'SELECT e.department, SUM(e.salary) as total_salary, COUNT(p.id) as project_count FROM employees e LEFT JOIN projects p ON e.id = p.employee_id GROUP BY e.department ORDER BY total_salary DESC;',
  }
];

const standardSchema = `
    CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    hire_date TEXT NOT NULL
    );
    CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
`;

const standardSeedData = `
    INSERT INTO employees VALUES (1, 'Alice Johnson', 'Engineering', 85000, '2020-01-15');
    INSERT INTO employees VALUES (2, 'Bob Smith', 'Marketing', 62000, '2019-03-22');
    INSERT INTO employees VALUES (3, 'Carol White', 'Engineering', 92000, '2018-07-10');
    INSERT INTO employees VALUES (4, 'David Brown', 'HR', 55000, '2021-05-01');
    INSERT INTO employees VALUES (5, 'Eva Martinez', 'Marketing', 71000, '2020-09-14');
    INSERT INTO projects VALUES (1, 'Website Redesign', 1);
    INSERT INTO projects VALUES (2, 'Mobile App', 3);
    INSERT INTO projects VALUES (3, 'Email Campaign', 2);
    INSERT INTO projects VALUES (4, 'HR Portal', 4);
    INSERT INTO projects VALUES (5, 'Analytics', 1);
`;

const generatedAssignments = [];
for (let i = 1; i <= 100; i++) {
  const templateIdx = (i - 1) % baseTemplates.length;
  const template = baseTemplates[templateIdx];

  // Create variations so the 100 aren't identical
  const variationSuffix = i > baseTemplates.length ? ` (Variation ${Math.ceil(i / baseTemplates.length)})` : '';

  generatedAssignments.push({
    order: i,
    title: `${template.title}${variationSuffix}`,
    description: `Practice Problem #${i}: ${template.description}`,
    difficulty: template.difficulty,
    topic: template.topic,
    points: template.points + (Math.floor(i / 10) * 5), // Points increase slightly for later problems
    schema: standardSchema,
    seedData: standardSeedData,
    expectedQuery: template.expectedQuery,
    hints: [
      `Hint 1 for Problem #${i}`,
      `Hint 2 for Problem #${i}`,
      `Final Hint for Problem #${i}`
    ]
  });
}

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    await Assignment.deleteMany({});
    console.log('Cleared existing assignments.');

    await Assignment.insertMany(generatedAssignments);
    console.log(`✅ Seeded ${generatedAssignments.length} assignments successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();
