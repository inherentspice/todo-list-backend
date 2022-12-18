require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const Todo = require('./models/todos');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
const todosData = [
  {
    "id": "62977",
    "name": "Finish Scaffolding",
    "isDone": true,
    "priority": "blue"
  },
  {
    "id": "34156",
    "name": "Implement Dark/Light Mode",
    "isDone": true,
    "priority": "green"
  },
  {
    "id": "99558",
    "name": "Make Beautiful CSS",
    "isDone": false,
    "priority": "orange"
  },
  {
    "id": "62534",
    "name": "Create Sidebar",
    "isDone": false,
    "priority": "red"
  },
  {
    "id": "98742",
    "name": "Implement Delete Todo Function",
    "isDone": false,
    "priority": "black"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/todos', (request, response) => {
  response.json(todosData)
})

app.get('/api/todos/:id', (request, response) => {
  Todo.findById(request.params.id)
    .then(todo => {
      if (todo) {
        response.json(todo);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => {
      console.log(error);
      response.status(400).send({ error: 'malformatted id' });
    })
})

app.post('/api/todos', (request, response) => {
  const body = request.body;

  if (body.content === undefined || body.priority === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const todo = new Todo({
    content: body.content,
    priority: body.priority,
    isDone: false,
  })
  todo.save().then(savedTodo => {
    response.json(savedTodo);
  });
})

app.delete('/api/todos/:id', (request, response) => {
  Todo.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => console.log(error))
})

app.put('/api/todos/:id', (request, response) => {
  const body = request.body;

  const todo = {
    content: body.content,
    priority: body.priority,
    isDone: body.isDone,
  }

  Todo.findByIdAndUpdate(request.params.id, todo, { new: true })
    .then(updatedTodo => {
      response.json(updatedTodo)
    })
    .catch(error => console.log(error))
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
