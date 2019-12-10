const redis = require('./redis-client');
const axios = require('axios');
const cheerio = require('cheerio');
const utils = require('./utils/index');

let total_crawled = 0;
let id = '';

async function _crawl(url, level) {   
	// Check if we've reached the last level
	// If so, no need to do anymore work
	if (level == 0) return;
	
	let urls = {};

	// Check request cache to see if page contents already stored
	const request_cached = await redis.getRequestCache(url);
	
	// Make request to URL if not cached
	if (utils.isnull(request_cached)) {
		urls = await _getPage(url).then(_getLinks);

		// Store links in cache
		try {
			await redis.setExRequestCache(url, JSON.stringify(urls));
		} catch(err){
			console.log('caught error when requesting cache');
			throw err;
		}
	} else urls = JSON.parse(request_cached);

	let record = JSON.parse(await redis.getCrawlRecord(id));
	let updatedRecord = _urlCount(urls, record);

	updatedRecord.urls_crawled = total_crawled;

	// Update results in record
	await redis.setCrawlRecord(id, JSON.stringify(updatedRecord));
	return await _crawl(url, level-1);	
}

// Add found URLs to record
function _urlCount(urls, record) {
	for (let i in urls) {
		let url = urls[i];

		if (record.urls[url] === undefined) record.urls[url] = 1;
		else record.urls[url]++;

		total_crawled++;
	}

	return record;
}

async function _getLinks($) {
	let urls = {};

	// Grab all links on page
	const links = $('a');

	$(links).each(function(i, link){
		const hrefString = ($(link).attr('href'));
		
		// Only grab absolute links
		var pat = /^https?:\/\//i;
		if (pat.test(hrefString)) {
   			urls[i] = hrefString;
		}
 	});

 	return urls;
}

async function _getPage(url) {
	const result = await axios.get(url);
	return cheerio.load(result.data);
};

// receive message from master process
process.on('message', async (message) => {  
	id = message.id;

	try {
		await _crawl(message.seedurl, message.levels);
	} catch(err){
		console.log('caught error when triggering crawl');
		throw err;
	}

	// Get record and mark as complete
	let final_record = JSON.parse(await redis.getCrawlRecord(id));
	final_record.status = 'complete';

	await redis.setCrawlRecord(id, JSON.stringify(final_record));

});

process.on('error', (err) => {
  console.log('in process error handler!!!');
  console.log(err);
});