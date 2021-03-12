const express = require("express");
const port = 8000;
const app = express();
const cors = require("cors");
app.use(cors());
app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`error in running the server: ${err}`);
  }
  console.log(`server is running on the port:${port}`);
});
