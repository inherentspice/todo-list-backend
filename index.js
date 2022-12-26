require('dotenv').config();
const bcrypt = require("bcryptjs");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const app = express();
const Todo = require('./models/todos');
const TodoLists = require('./models/todo-lists');
const User = require("./models/user");

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }))

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.post("/sign-up", (req, res, next) => {
  User.findOne({ username: req.body.username }, (err, existingUser) => {

    if (err) {
      return next(err);

    }
    if (existingUser) {
      return res.status(400).send({ message: "Username already taken" });
    }

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        const user = new User({
          username: req.body.username,
          password: hashedPassword
        }).save(err => {
          if (err) {
            return next(err);
          }
          res.status(200).send({ message: "sign up successful", username: req.body.username });
        });
      }
    })
  })
});

app.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send({ message: "Incorrect username and password" });
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      return res.status(200).send({ message: "Log in successful", username: req.body.username });
    });
  })(req, res, next);
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.send({ user: req.user });
  } else {
    res.status(401).send({ message: 'You are not authenticated' });
  }
});

app.get('/api/todos', (request, response, next) => {
  const listName = request.query.list;

  const user = request.user

  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

  if (listName) {
    Todo.find({ list: listName, username: user.username})
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
  const user = request.user;
  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

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
    username: user.username
  })

  console.log(todo);
  todo.save().then(savedTodo => {
    response.json(savedTodo);
  });
})

app.delete('/api/todos', (request, response, next) => {
  const list = request.query.list;
  const user = request.user;

  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

  if (!list) {
    return response.status(400).json({
      error: 'list parameter missing'
    });
  }

  Todo.deleteMany({ list: list, username: user.username })
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error));
});


app.delete('/api/todos/:id', (request, response, next) => {
  const user = request.user;
  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

  Todo.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/todos/:id', (request, response, next) => {
  const body = request.body;
  const user = request.user;

  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

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
  const user = request.user;
  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }
  TodoLists.find({ username: user.username })
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.post('/api/todolists/', (request, response, next) => {
  const body = request.body;
  const user = request.user;

  if (user==="undefined") {
    return response.status(400).json({
      error: "user not authenticated"
    })
  }
  if (body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const todoList = new TodoLists({
    content: body.content,
    toggled: false,
    username: user.username
  })
  todoList.save().then(savedTodoList => {
    response.json(savedTodoList);
  });
})

app.delete('/api/todolists/:id', (request, response, next) => {
  const user = request.user;
  if (user==="undefined") {
    return response.status(405).json({
      error: 'user not authenticated'
    });
  }

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
