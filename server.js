/*
 * Project
 * csci4131
 * 12/19/22
 * Peyton Okubo
 * okubo012
 */


/* modules */
const express = require('express');
const path = require("path");
const db = require("./resources/js/db");
const app = express();
const port = 3007;

/* configure express app */
app.use(                                      // set static files
  "/resources",
  express.static(path.join(__dirname, 'resources'))
);
/* REEEEEEEEEEEEEEEEEEEEE */
app.use(express.json()); // body parser
app.set("view engine", "pug");
app.set("views", "templates");


/* basic routing */
app.get("/", (_, res) => {
  res.redirect("/fibBSPViTodo");
});

app.get("/fibBSPViTodo", (_, res) => {
  res.render("fibBSPViTodo");
});

/*
  * I only used this to prototype the fibonacci bsp layout, leaving this
  * to help with understanding the layout as it's a minimal static
  * implementation.
  */
app.get("/bsp", (_, res) => {
  res.render("bsp");
});


/* DB interaction */
app.get("/api/tasks", async (req, res) => {
  const key = req.query.key;
  const value = req.query.value;
  let filter;

  if (key && value) {
    filter = {
      key: key,
      value: value,
    };
  }

  const tasks = await db.getTasks(filter);
  res.json(tasks);
});

app.put("/api/tasks", async (req, res) => {
  await db.updateTask(req.body.task);
  const tasks = await db.getTasks();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  await db.insertTask(req.body.task);
  const tasks = await db.getTasks();
  res.json(tasks);
});

app.delete("/api/tasks", async (req, res) => {
  await db.deleteTask(req.body.id);
  const tasks = await db.getTasks();
  res.json(tasks);
});


/* start server */
app.listen(port, () => {
  console.log(`Web Todo App listening on port ${port}`);
});

