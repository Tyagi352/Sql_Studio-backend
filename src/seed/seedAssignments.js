require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const domains = [
  {
    topic: 'HR',
    schema: `
      CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department_id INTEGER, salary REAL, hire_date TEXT);
      CREATE TABLE departments (id INTEGER PRIMARY KEY, dept_name TEXT, budget REAL);
    `,
    seedData: `
      INSERT INTO departments VALUES (1, 'Engineering', 500000);
      INSERT INTO departments VALUES (2, 'Sales', 300000);
      INSERT INTO departments VALUES (3, 'Marketing', 250000);
      INSERT INTO employees VALUES (1, 'Alice', 1, 85000, '2020-01-15');
      INSERT INTO employees VALUES (2, 'Bob', 2, 60000, '2021-03-22');
      INSERT INTO employees VALUES (3, 'Charlie', 1, 95000, '2019-07-10');
      INSERT INTO employees VALUES (4, 'David', 3, 55000, '2022-01-05');
      INSERT INTO employees VALUES (5, 'Eve', 2, 62000, '2021-08-14');
    `,
    T1: 'employees', T2: 'departments',
    C1: 'name', C2: 'salary',
    NUM_COL: 'salary', NUM_VAL: '70000',
    CAT_COL: 'department_id',
    JOIN_COND: 'employees.department_id = departments.id',
    T2_STR_COL: 'dept_name'
  },
  {
    topic: 'E-commerce',
    schema: `
      CREATE TABLE customers (id INTEGER PRIMARY KEY, customer_name TEXT, country TEXT);
      CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total_amount REAL, order_date TEXT);
    `,
    seedData: `
      INSERT INTO customers VALUES (1, 'John Doe', 'USA');
      INSERT INTO customers VALUES (2, 'Jane Smith', 'UK');
      INSERT INTO customers VALUES (3, 'Ahmed Ali', 'UAE');
      INSERT INTO orders VALUES (1, 1, 250.50, '2023-01-10');
      INSERT INTO orders VALUES (2, 2, 120.00, '2023-01-12');
      INSERT INTO orders VALUES (3, 1, 340.20, '2023-02-15');
      INSERT INTO orders VALUES (4, 3, 50.00, '2023-03-01');
      INSERT INTO orders VALUES (5, 2, 430.00, '2023-03-05');
    `,
    T1: 'orders', T2: 'customers',
    C1: 'id', C2: 'total_amount',
    NUM_COL: 'total_amount', NUM_VAL: '200',
    CAT_COL: 'customer_id',
    JOIN_COND: 'orders.customer_id = customers.id',
    T2_STR_COL: 'customer_name'
  },
  {
    topic: 'University',
    schema: `
      CREATE TABLE students (id INTEGER PRIMARY KEY, student_name TEXT, major TEXT, gpa REAL);
      CREATE TABLE courses (id INTEGER PRIMARY KEY, course_name TEXT, credits INTEGER, student_id INTEGER);
    `,
    seedData: `
      INSERT INTO students VALUES (1, 'Emily', 'Computer Science', 3.8);
      INSERT INTO students VALUES (2, 'Michael', 'Mathematics', 3.5);
      INSERT INTO students VALUES (3, 'Sarah', 'Physics', 3.9);
      INSERT INTO courses VALUES (1, 'Algorithms', 4, 1);
      INSERT INTO courses VALUES (2, 'Calculus', 4, 2);
      INSERT INTO courses VALUES (3, 'Quantum Mechanics', 3, 3);
      INSERT INTO courses VALUES (4, 'Data Structures', 4, 1);
      INSERT INTO courses VALUES (5, 'Linear Algebra', 3, 2);
    `,
    T1: 'students', T2: 'courses',
    C1: 'student_name', C2: 'gpa',
    NUM_COL: 'gpa', NUM_VAL: '3.6',
    CAT_COL: 'major',
    JOIN_COND: 'courses.student_id = students.id',
    T2_STR_COL: 'course_name'
  },
  {
    topic: 'Library',
    schema: `
      CREATE TABLE authors (id INTEGER PRIMARY KEY, author_name TEXT, country TEXT);
      CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER, pages INTEGER, year INTEGER);
    `,
    seedData: `
      INSERT INTO authors VALUES (1, 'George Orwell', 'UK');
      INSERT INTO authors VALUES (2, 'J.K. Rowling', 'UK');
      INSERT INTO authors VALUES (3, 'Mark Twain', 'USA');
      INSERT INTO books VALUES (1, '1984', 1, 328, 1949);
      INSERT INTO books VALUES (2, 'Animal Farm', 1, 112, 1945);
      INSERT INTO books VALUES (3, 'Harry Potter 1', 2, 223, 1997);
      INSERT INTO books VALUES (4, 'Harry Potter 2', 2, 251, 1998);
      INSERT INTO books VALUES (5, 'Tom Sawyer', 3, 274, 1876);
    `,
    T1: 'books', T2: 'authors',
    C1: 'title', C2: 'pages',
    NUM_COL: 'pages', NUM_VAL: '200',
    CAT_COL: 'author_id',
    JOIN_COND: 'books.author_id = authors.id',
    T2_STR_COL: 'author_name'
  },
  {
    topic: 'Healthcare',
    schema: `
      CREATE TABLE doctors (id INTEGER PRIMARY KEY, doc_name TEXT, specialty TEXT);
      CREATE TABLE appointments (id INTEGER PRIMARY KEY, patient_name TEXT, doctor_id INTEGER, cost REAL);
    `,
    seedData: `
      INSERT INTO doctors VALUES (1, 'Dr. Smith', 'Cardiology');
      INSERT INTO doctors VALUES (2, 'Dr. Jones', 'Neurology');
      INSERT INTO doctors VALUES (3, 'Dr. Lee', 'Pediatrics');
      INSERT INTO appointments VALUES (1, 'Tom', 1, 150.0);
      INSERT INTO appointments VALUES (2, 'Jerry', 1, 200.0);
      INSERT INTO appointments VALUES (3, 'Mickey', 2, 350.0);
      INSERT INTO appointments VALUES (4, 'Donald', 3, 100.0);
      INSERT INTO appointments VALUES (5, 'Goofy', 3, 120.0);
    `,
    T1: 'appointments', T2: 'doctors',
    C1: 'patient_name', C2: 'cost',
    NUM_COL: 'cost', NUM_VAL: '150',
    CAT_COL: 'doctor_id',
    JOIN_COND: 'appointments.doctor_id = doctors.id',
    T2_STR_COL: 'doc_name'
  },
  {
    topic: 'Real Estate',
    schema: `
      CREATE TABLE agents (id INTEGER PRIMARY KEY, agent_name TEXT, agency TEXT);
      CREATE TABLE properties (id INTEGER PRIMARY KEY, address TEXT, agent_id INTEGER, price REAL, bedrooms INTEGER);
    `,
    seedData: `
      INSERT INTO agents VALUES (1, 'Nancy', 'Prime Realty');
      INSERT INTO agents VALUES (2, 'Drew', 'City Homes');
      INSERT INTO properties VALUES (1, '123 Main St', 1, 450000, 3);
      INSERT INTO properties VALUES (2, '456 Oak St', 1, 550000, 4);
      INSERT INTO properties VALUES (3, '789 Pine St', 2, 300000, 2);
      INSERT INTO properties VALUES (4, '101 Maple Ave', 2, 600000, 5);
      INSERT INTO properties VALUES (5, '202 Elm St', 1, 350000, 2);
    `,
    T1: 'properties', T2: 'agents',
    C1: 'address', C2: 'price',
    NUM_COL: 'price', NUM_VAL: '400000',
    CAT_COL: 'agent_id',
    JOIN_COND: 'properties.agent_id = agents.id',
    T2_STR_COL: 'agent_name'
  },
  {
    topic: 'Automotive',
    schema: `
      CREATE TABLE brands (id INTEGER PRIMARY KEY, brand_name TEXT, hq_country TEXT);
      CREATE TABLE cars (id INTEGER PRIMARY KEY, model TEXT, brand_id INTEGER, horsepower INTEGER, price REAL);
    `,
    seedData: `
      INSERT INTO brands VALUES (1, 'Toyota', 'Japan');
      INSERT INTO brands VALUES (2, 'Ford', 'USA');
      INSERT INTO brands VALUES (3, 'BMW', 'Germany');
      INSERT INTO cars VALUES (1, 'Camry', 1, 203, 25000);
      INSERT INTO cars VALUES (2, 'Corolla', 1, 139, 20000);
      INSERT INTO cars VALUES (3, 'Mustang', 2, 310, 27000);
      INSERT INTO cars VALUES (4, 'F-150', 2, 400, 35000);
      INSERT INTO cars VALUES (5, 'X5', 3, 335, 60000);
    `,
    T1: 'cars', T2: 'brands',
    C1: 'model', C2: 'horsepower',
    NUM_COL: 'horsepower', NUM_VAL: '200',
    CAT_COL: 'brand_id',
    JOIN_COND: 'cars.brand_id = brands.id',
    T2_STR_COL: 'brand_name'
  },
  {
    topic: 'Technology',
    schema: `
      CREATE TABLE manufacturers (id INTEGER PRIMARY KEY, mfg_name TEXT, founded INTEGER);
      CREATE TABLE gadgets (id INTEGER PRIMARY KEY, gadget_name TEXT, mfg_id INTEGER, battery_mah INTEGER);
    `,
    seedData: `
      INSERT INTO manufacturers VALUES (1, 'Apple', 1976);
      INSERT INTO manufacturers VALUES (2, 'Samsung', 1938);
      INSERT INTO manufacturers VALUES (3, 'Sony', 1946);
      INSERT INTO gadgets VALUES (1, 'iPhone 13', 1, 3227);
      INSERT INTO gadgets VALUES (2, 'iPad Pro', 1, 7538);
      INSERT INTO gadgets VALUES (3, 'Galaxy S21', 2, 4000);
      INSERT INTO gadgets VALUES (4, 'Galaxy Tab S7', 2, 8000);
      INSERT INTO gadgets VALUES (5, 'Xperia 1', 3, 3330);
    `,
    T1: 'gadgets', T2: 'manufacturers',
    C1: 'gadget_name', C2: 'battery_mah',
    NUM_COL: 'battery_mah', NUM_VAL: '4000',
    CAT_COL: 'mfg_id',
    JOIN_COND: 'gadgets.mfg_id = manufacturers.id',
    T2_STR_COL: 'mfg_name'
  },
  {
    topic: 'Finance',
    schema: `
      CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, joined_date TEXT);
      CREATE TABLE transactions (id INTEGER PRIMARY KEY, amount REAL, user_id INTEGER, type TEXT);
    `,
    seedData: `
      INSERT INTO users VALUES (1, 'user1', '2023-01-01');
      INSERT INTO users VALUES (2, 'user2', '2023-02-15');
      INSERT INTO users VALUES (3, 'user3', '2023-03-10');
      INSERT INTO transactions VALUES (1, 1000.0, 1, 'deposit');
      INSERT INTO transactions VALUES (2, -200.0, 1, 'withdrawal');
      INSERT INTO transactions VALUES (3, 500.0, 2, 'deposit');
      INSERT INTO transactions VALUES (4, 1500.0, 3, 'deposit');
      INSERT INTO transactions VALUES (5, -300.0, 3, 'withdrawal');
    `,
    T1: 'transactions', T2: 'users',
    C1: 'type', C2: 'amount',
    NUM_COL: 'amount', NUM_VAL: '0',
    CAT_COL: 'user_id',
    JOIN_COND: 'transactions.user_id = users.id',
    T2_STR_COL: 'username'
  },
  {
    topic: 'Cinema',
    schema: `
      CREATE TABLE directors (id INTEGER PRIMARY KEY, dir_name TEXT, oscars INTEGER);
      CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT, director_id INTEGER, box_office REAL);
    `,
    seedData: `
      INSERT INTO directors VALUES (1, 'Spielberg', 3);
      INSERT INTO directors VALUES (2, 'Nolan', 0);
      INSERT INTO directors VALUES (3, 'Cameron', 3);
      INSERT INTO movies VALUES (1, 'Jurassic Park', 1, 1000.0);
      INSERT INTO movies VALUES (2, 'E.T.', 1, 792.0);
      INSERT INTO movies VALUES (3, 'Inception', 2, 836.0);
      INSERT INTO movies VALUES (4, 'Avatar', 3, 2800.0);
      INSERT INTO movies VALUES (5, 'Titanic', 3, 2200.0);
    `,
    T1: 'movies', T2: 'directors',
    C1: 'title', C2: 'box_office',
    NUM_COL: 'box_office', NUM_VAL: '1000',
    CAT_COL: 'director_id',
    JOIN_COND: 'movies.director_id = directors.id',
    T2_STR_COL: 'dir_name'
  }
];

const templates = [
  {
    name: 'Select All',
    desc: 'Retrieve all records from the {T1} table.',
    difficulty: 'easy',
    topic: 'SELECT Basics',
    points: 10,
    expectedQuery: 'SELECT * FROM {T1};'
  },
  {
    name: 'Select Specific Columns',
    desc: 'Retrieve only the {C1} and {C2} columns from the {T1} table.',
    difficulty: 'easy',
    topic: 'SELECT Basics',
    points: 10,
    expectedQuery: 'SELECT {C1}, {C2} FROM {T1};'
  },
  {
    name: 'Filter Data',
    desc: 'Find all records in the {T1} table where {NUM_COL} is greater than {NUM_VAL}.',
    difficulty: 'easy',
    topic: 'WHERE Filtering',
    points: 10,
    expectedQuery: 'SELECT * FROM {T1} WHERE {NUM_COL} > {NUM_VAL};'
  },
  {
    name: 'Count Records',
    desc: 'Count the total number of records in the {T1} table.',
    difficulty: 'easy',
    topic: 'Aggregates',
    points: 10,
    expectedQuery: 'SELECT COUNT(*) FROM {T1};'
  },
  {
    name: 'Maximum Value',
    desc: 'Find the highest {NUM_COL} across all records in the {T1} table.',
    difficulty: 'medium',
    topic: 'Aggregates',
    points: 20,
    expectedQuery: 'SELECT MAX({NUM_COL}) FROM {T1};'
  },
  {
    name: 'Group and Count',
    desc: 'Count the number of {T1} records for each {CAT_COL}.',
    difficulty: 'medium',
    topic: 'GROUP BY',
    points: 20,
    expectedQuery: 'SELECT {CAT_COL}, COUNT(*) FROM {T1} GROUP BY {CAT_COL};'
  },
  {
    name: 'Average by Group',
    desc: 'Calculate the average {NUM_COL} for each {CAT_COL} in the {T1} table.',
    difficulty: 'medium',
    topic: 'GROUP BY',
    points: 20,
    expectedQuery: 'SELECT {CAT_COL}, AVG({NUM_COL}) FROM {T1} GROUP BY {CAT_COL};'
  },
  {
    name: 'Basic Join',
    desc: 'Retrieve all {T1} along with their corresponding {T2} information.',
    difficulty: 'medium',
    topic: 'JOINs',
    points: 25,
    expectedQuery: 'SELECT * FROM {T1} JOIN {T2} ON {JOIN_COND};'
  },
  {
    name: 'Join with Aggregation',
    desc: 'For each {T2_STR_COL} in the {T2} table, find the total sum of {NUM_COL} from {T1}.',
    difficulty: 'hard',
    topic: 'Complex Queries',
    points: 35,
    expectedQuery: 'SELECT {T2}.{T2_STR_COL}, SUM({T1}.{NUM_COL}) FROM {T1} JOIN {T2} ON {JOIN_COND} GROUP BY {T2}.{T2_STR_COL};'
  },
  {
    name: 'Subquery',
    desc: 'Find all {T1} where the {NUM_COL} is greater than the overall average {NUM_COL} of the {T1} table.',
    difficulty: 'hard',
    topic: 'Subqueries',
    points: 40,
    expectedQuery: 'SELECT * FROM {T1} WHERE {NUM_COL} > (SELECT AVG({NUM_COL}) FROM {T1});'
  }
];

const replaceVars = (str, domain) => {
    return str
        .replace(/{T1}/g, domain.T1)
        .replace(/{T2}/g, domain.T2)
        .replace(/{C1}/g, domain.C1)
        .replace(/{C2}/g, domain.C2)
        .replace(/{NUM_COL}/g, domain.NUM_COL)
        .replace(/{NUM_VAL}/g, domain.NUM_VAL)
        .replace(/{CAT_COL}/g, domain.CAT_COL)
        .replace(/{JOIN_COND}/g, domain.JOIN_COND)
        .replace(/{T2_STR_COL}/g, domain.T2_STR_COL);
};

const generatedAssignments = [];
let order = 1;

for (const domain of domains) {
  for (const tpl of templates) {
    generatedAssignments.push({
      order: order,
      title: `[${domain.topic}] ${tpl.name}`,
      description: `Practice Problem #${order}: ${replaceVars(tpl.desc, domain)}`,
      difficulty: tpl.difficulty,
      topic: tpl.topic,
      points: tpl.points,
      schema: domain.schema,
      seedData: domain.seedData,
      expectedQuery: replaceVars(tpl.expectedQuery, domain),
      hints: [
        'Review the schema tables.',
        `Consider using the ${domain.T1} table.`,
        'Check your SQL syntax carefully.'
      ]
    });
    order++;
  }
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

