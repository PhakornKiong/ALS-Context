const ALS = require('alscontext').default;
const express = require('express');

const als = new ALS();
const app = express();
const port = 3000;

app.use((req, res, next) => {
  // als.run() creates a new context with a default object here
  als.run({ user: 'John Doe' }, () => {
    // You may do other operation here before passing the the next middleware
    next();
  });
});

app.use((req, res, next) => {
  als.get('user'); // Return "John Doe"
  als.set('user', 'Max'); // Set the "user" key to "Max"
  next();
});

app.get('/', (req, res) => {
  // als.getStore() returns a Map
  res.json({ store: als.getStore() });
});

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}/`);
});
