const { fork } = require('child_process');
const fs = require('fs');
const express = require('express');
const app = express()
const PORT = process.env.PORT || 9000
const uuidv4 = require('uuid/v4');
const redis = require("./redis-client");
const utils = require('./utils/index');
const showdown = require('showdown');
const converter = new showdown.Converter();

/* Configure express app */
app.use(express.json());

/* Serve API instructions */
app.get('/', function(req, res) {
  fs.readFile(__dirname + '/welcome.md', 'utf-8', function(err, data) {
    return res.status(500).send({ error: 'Server error' })
    res.send(converter.makeHtml(data));
  });
});

/* Get status of an existing job */
app.get('/status/:id', async function(req, res) {
    const status = {};
    const record = JSON.parse(await redis.getCrawlRecord(req.params.id));

    if (utils.isnull(record)) {
      return res.status(404).send({ error: 'Crawl ID does not exist' })
    }

    status['status'] = record.status;
    status['unique urls crawled'] = (Object.keys(record.urls)).length;
    return res.json(status);
});

/* Get url results of an existing job */
app.get('/result/:id', async function(req, res) {
    const record = JSON.parse(await redis.getCrawlRecord(req.params.id));
    
    if (utils.isnull(record)) {
      return res.status(404).send({ error: 'Crawl ID does not exist' })
    }

    return res.json(record.urls);
});

/* Create a new crawl job */
app.post('/', async function (req, res) {
  // TODO: Validate seed url in request body

  // Create unique id for redis key
  const id = uuidv4();

  // fork another process
  const process = fork('./crawler.js');

  const msg = {
  	id: id, 
  	seedurl: req.body.seedurl, 
  	levels: req.body.levels,
    status: 'pending',
    urls: {}
  }
  
  // Put new record into datastore
  try {
    await redis.setCrawlRecord(id, JSON.stringify(msg));
  } catch(err) {
    console.log('caught error when trying to set the record for first time');
    throw err;
  }
  
  // Send message to crawler to start crawling
  process.send(msg); 

  return res.json(msg);

});

app.listen(PORT, () => console.log(`Crawler ready on port ${PORT}...`))

// Export for testing
module.exports = app;
