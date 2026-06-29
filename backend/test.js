const express = require('express');
const app = express();
const server = app.listen(3005, () => {
  console.log("Listening on 3005");
});
console.log("Server unref?", server.unref ? "Yes" : "No");
