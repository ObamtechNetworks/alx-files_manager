const express = require('express');
const dotenv = require('dotenv');
// const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// LOAD ROUTES
const routes = require('./routes/index');

// use the routes
app.use(routes);

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
