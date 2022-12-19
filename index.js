require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const Todo = require('./models/todos');
const TodoLists = require('./models/todo-lists');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.get('/api/todos', (request, response, next) => {
  Todo.find()
    .then(todos => {
      response.json(todos);
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/todos/:id', (request, response, next) => {
  Todo.findById(request.params.id)
    .then(todo => {
      if (todo) {
        response.json(todo);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => {
      next(error);
    })
})

app.post('/api/todos', (request, response, next) => {
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

app.delete('/api/todos/:id', (request, response, next) => {
  Todo.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/todos/:id', (request, response, next) => {
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
    .catch(error => next(error))
})

app.get('/api/todolists', (request, response, next) => {
  TodoLists.find()
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.use((req, res, next) => {
  // catch any validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  // catch any cast errors
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  // catch any errors thrown by Mongoose methods
  if (error.name === 'MongoError') {
    return res.status(500).send({ error: error.message });
  }

  // catch any other errors
  return res.status(500).send({ error: 'something went wrong' });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
