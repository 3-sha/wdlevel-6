const express = require("express");
const app = express();
let csrf = require("tiny-csrf");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const { response } = require("express");
const todo = require("./models/todo");
let cookieParser = require("cookie-parser");
//app.js
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_charactes_long", ["PUT", "POST", "DELETE"]));

app.set("view engine", "ejs");
app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
    });
  } else {
    res.json(allTodos);
  }
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.findAll({ order: [["id", "ASC"]] });
    return res.json(todos);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("Body : ", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("marks as completed : ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updateTodo = await todo.setCompletionStatus(request.body.completed);
    return res.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (req, res) => {
  console.log("deletion a Todo using ID: ", req.params.id);
  const affectedRow = await Todo.destroy({ where: { id: req.params.id } });
  res.send(affectedRow ? true : false);
});

module.exports = app;
