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
  const listName = request.query.list;
  if (listName) {
    Todo.find({ list: listName })
      .then(todos => {
        response.json(todos);
      })
      .catch(error => {
        next(error)
      })
  } else {
    Todo.find()
      .then(todos => {
        response.json(todos);
      })
      .catch(error => {
        next(error)
      })
  }
});

app.post('/api/todos', (request, response, next) => {
  const body = request.body;

  if (body.content === undefined
    || body.priority === undefined
    || body.list === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const todo = new Todo({
    content: body.content,
    priority: body.priority,
    isDone: false,
    list: body.list,
  })
  todo.save().then(savedTodo => {
    response.json(savedTodo);
  });
})

app.delete('/api/todos', (request, response, next) => {
  const list = request.query.list;
  if (!list) {
    return response.status(400).json({
      error: 'list parameter missing'
    });
  }

  Todo.deleteMany({ list: list })
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error));
});


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

app.post('/api/todolists/', (request, response, next) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const todoList = new TodoLists({
    content: body.content,
    toggled: false,
  })
  todoList.save().then(savedTodoList => {
    response.json(savedTodoList);
  });
})

app.delete('/api/todolists/:id', (request, response, next) => {
  TodoLists.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
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
