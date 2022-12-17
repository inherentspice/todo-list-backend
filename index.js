const express = require("express");
const app = express();

app.use(express.json())
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
  const id = Number(request.params.id);
  const todo = todosData.find(todo => todo.id === id);
  if (todo) {
    response.json(todo);
  } else {
    response.status(404).end();
  }
})

const generateId = () => {
  const maxId = todosData.length > 0
    ? Math.max(...todosData.map(n => n.id))
    : 0;
    return maxId + 1;
}

app.post('/api/todos', (request, response) => {
  const body = request.body;

  if (!body.content || !body.priority) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const todo = {
    content: body.content,
    priority: body.priority,
    isDone: false,
    id: generateId(),
  }
  todosData.concat(todo);
  console.log(todosData);
  response.json(todo);
})

app.delete('/api/todos/:id', (request, response) => {
  const id = Number(request.params.id);
  const todos = todosData.filter(todo => todo.id !== id);

  response.status(204).end();
})
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
