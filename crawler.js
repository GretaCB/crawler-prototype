const redis = require('./redis-client');
const axios = require('axios');
const cheerio = require('cheerio');
const utils = require('./utils/index');

let total_crawled = 0;
let id = '';

async function crawl(url, level) {   
	// Check if we've reached the last level
	// If so, no need to do anymore work
	if (level == 0) return;
	let urls = {};
	let record;
	console.log('about to call getCrawlRecord');
	try {
		record = await redis.getCrawlRecord(id);
	} catch(err){
		console.log('caught error when getting record in crawl');
		throw err;
	}
	
	console.log(record);
	
	record = {};
	record.urls_crawled = total_crawled;
	console.log(record);
	// Update results in record
	await redis.setCrawlRecord(id, JSON.stringify(record));
	return await crawl(url, level-1);	
}

// receive message from master process
process.on('message', async (message) => {  
	id = message.id;

	console.log('about to run crawl for the first time');
	try {
		await crawl(message.seedurl, message.levels);
	} catch(err){
		console.log('caught error when triggering crawl');
		throw err;
	}

	// Get record and mark as complete
	let final_record = await redis.getCrawlRecord(id);
	console.log('record at end of process: ' + final_record);
	final_record.status = 'complete';
	await redis.setCrawlRecord(id, JSON.stringify(final_record));

});

process.on('error', (err) => {
	console.log('in error handler!!!');
  console.log(err);
  //process.exit(err);
});