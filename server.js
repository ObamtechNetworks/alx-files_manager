const express = require('express');
const index = require('./routes/index');

const port = process.env.PORT || 5000;
const app = express();

// loading all routes from index.js
app.use(express.json());
app.use('/', index);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
