require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require("./repository/repository");
const bodyParser = require("body-parser");
const dns = require("dns");
const util = require("util");
const connectDB = require("./repository/db-connection");

const port = process.env.PORT || 3000;

const lookupPromise = util.promisify(dns.lookup);

connectDB();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", async (req, res) => {
  try {
    const submittedUrl = new URL(req.body.url);
    const domain = submittedUrl.hostname;
    await lookupPromise(domain);
    const savedUrl = db.createShortenedUrl(submittedUrl);
    res.send(savedUrl);
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      res.json({"error": "Invalid Hostname"});
    } else if (error instanceof TypeError) {
      res.json({"error": "Invalid URL"});
    } else {
      res.json({"error": "An unknown error occurred"});
    }
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
