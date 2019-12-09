const { fork } = require('child_process');
const express = require("express")
const app = express()
const port = 9000
const uuidv4 = require('uuid/v4');
const redis = require("./redis-client");

/* Configure express app */
app.use(express.json());

app.get('/', function(req, res) {
    res.send('How to use the Crawler service...');
});

app.post('/', async function (req, res) {
  // Validate seed url in request body

  // Create unique id for redis key
  const id = uuidv4();

  // fork another process
  const process = fork('./crawler.js');

  const msg = {
  	id: id, 
  	seedurl: req.body.seedurl, 
  	levels: req.body.levels,
    status: 'pending'
  }
  
  // Put new record into datastore
  await redis.setCrawlRecord(id, JSON.stringify(msg));
  
  // Send message to crawler to start crawling
  process.send(msg); 

  return res.json(msg);

});

app.listen(port, () => console.log(`Crawler ready on port ${port}...`))

// Export for testing
module.exports = app;
