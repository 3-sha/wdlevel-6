const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(bodyParser.json());
const path = require("path");
const todo = require("./models/todo");

//app.js
app.use(express.static(path.join(__dirname , "/public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(
  session({
    secret: "my-super-secret-key-21728173615375893",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(csrf("this_should_be_32_charactes_long", ["PUT", "POST", "DELETE"]));

app.set("view engine", "ejs");
app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overdue();
  const dueLater = await Todo.dueLater();
  const dueToday = await Todo.dueToday();
  const completedItems = await Todo.completedItems();
  if (request.accepts("html")) {
    response.render("index", {
       title: "Todo Application",
      allTodos,
      overdue,
      dueLater,
      dueToday,
      completedItems,
      csrfToken: request.csrfToken(),
    });
  } else {
    res.json(overdue, dueLater, dueToday, completedItems);
  }
});

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll({ order: [["id", "ASC"]] });
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.post("/todos", async (request, response) => {
  console.log("Body : ", req.body);
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("marks as completed : ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updateTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (request, response) => {
 try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
