/*
 * Database Interaction
 */


let mysql = require("mysql");


/*********************************************************
 * Private DB **6774**
 ********************************************************/


// connection pool: https://www.npmjs.com/package/mysql#pooling-connections
let connPool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    /* host: "cse-mysql-classes-01.cse.umn.edu", */
    user: "C4131F22U82",
    database: "C4131F22U82",
    password: "6774"
  });

/* select * from Tasks where isDone=true; */
function getFilterQuery(filter) {
  let query = `select * from Tasks`;
  let values = [];

  if (filter && !(filter.key === "isDone" && filter.value === "all")) {
    /* I couldn't find for the life of me how to escape
      * the key for where clauses :/ . For some reason the typical
      * '?' -> value escaping method doesn't work. */
    query += ` where ${filter.key} = ?`;
    values.push(filter.value);
  }

  return {
    query: query,
    values: values,
  };
}

function getInsertionQuery(task) {
  let query = `insert into Tasks `;
  let values = [];
  let valuesStr = [];

  let fields = [];
  for (const key in task) {
    /* task not in db yet, let db assign the task id */
    if (key == "id") { continue; }

    fields.push(key);
    values.push(task[key]);
    valuesStr.push("?");
  }

  query += `
    (${fields.join(", ")})
    values (${valuesStr.join(", ")})
  `;

  return {
    query: query,
    values: values,
  }
}

/* update Tasks set Title="Updated Title" where TaskID=1; */
function getUpdateQuery(task) {
  let query = `update Tasks set `;
  let values = [];
  let valuesStr = [];

  for (const key in task) {
    /* don't attempt to update id or creation time */
    if (key == "id" || key == "time") { continue; }

    /* same issue as with where keys, can't escape set keys either */
    valuesStr.push(`${key} = ?`);
    values.push(task[key]);
  }

  query += `${valuesStr.join(", ")} `;
  query += `where id = ?`;
  values.push(task.id);

  return {
    query: query,
    values: values,
  }
}

function getDeleteQuery(id) {
  let query = `delete from Tasks where id = ?`;
  let values = [id];

  return {
    query: query,
    values: values,
  }
}

/*********************************************************
 * Public DB
 ********************************************************/

exports.getTasks = function(filter) {
  return new Promise((resolve, reject) => {
    const { query, values } = getFilterQuery(filter);
    connPool.query(query, values, (err, rows) => {
      // converting to promise -- if error, reject otherwise resolve.
      if (err) {
        reject(err);
      }
      else {
        resolve(rows);
      }
    });
  });
}

exports.insertTask = function(task) {
  return new Promise((resolve, reject) => {
    const { query, values } = getInsertionQuery(task);
    connPool.query(query, values, (err, rows) => {
      // converting to promise -- if error, reject otherwise resolve.
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.updateTask = function(task) {
  return new Promise((resolve, reject) => {
    const { query, values } = getUpdateQuery(task);
    connPool.query(query, values, (err, rows) => {
      // converting to promise -- if error, reject otherwise resolve.
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.deleteTask = function(id) {
  return new Promise((resolve, reject) => {
    const { query, values } = getDeleteQuery(id);
    connPool.query(query, values, (err, rows) => {
      // converting to promise -- if error, reject otherwise resolve.
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/* testing/usage */
// getTasks().then(console.log);
// getTasks({ key: "isDone", value: true }).then(console.log);

// deleteTask(1);

// const taskNotDone = {
//     id: null,
//     title: "Test 1",
//     description: "Task is not Done",
//     isDone: false,
// };
// const taskDone = {
//     id: null,
//     title: "Test 2",
//     description: "Task is Done",
//     isDone: true,
// };
// insertTask(taskNotDone).then(console.log);
// insertTask(taskDone).then(console.log);

// updateTask({
//   id: 1,
//   title: "New Title",
//   description: "...",
//   isDone: true
// });
