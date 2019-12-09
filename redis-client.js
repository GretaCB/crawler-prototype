const redis = require('redis');
const client = redis.createClient();
const {promisify} = require('util');

const _requestcache = 1; // cache of already-requested page contents
const _crawlstore = 2;  // datastore of crawls: triggered via the POST endpoint
const _resultsstore = 3; // when spiders reach maxDepth, they push their results here?

async function _getRequestCache(key) {
	const switchTo = promisify(client.select).bind(client);
	await switchTo(_requestcache);

	const get = promisify(client.get).bind(client);
	return get(key).then(function(res) {
   		return res;
	});
}

async function _setRequestCache(key, val) {
	const switchTo = promisify(client.select).bind(client);
	await switchTo(_requestcache);

	const set = promisify(client.set).bind(client);
	return set(key, val, 'EX', 3600).then(function(huh) {
		return;
	});
}

async function _getCrawlRecord(key) {
	const switchTo = promisify(client.select).bind(client);
	await switchTo(_crawlstore);

	const get = promisify(client.get).bind(client);
	return get(key).then(function(res) {
		console.log(key);
   		return res;
	});
}

async function _setCrawlRecord(key, val) {
	const switchTo = promisify(client.select).bind(client);
	await switchTo(_crawlstore);

	const set = promisify(client.set).bind(client);
	return set(key, val).then(function(huh) {
		console.log('huh: ' + huh);
		return;
	});
}

client.on('error', (err) => {
  console.log(err);
});

// TODO: Is there a way to not trigger this for tests? Perhaps a redis mock?
// client.on('ready', () => {
// 	console.log('Flushing all DBs for fresh start (only use for prototype)...');
// 	client.flushall();
// 	console.log('Redis is ready!');
// });

client.on('end', () => {
  console.log('Redis says goodbye!');
  console.log('Crawler process exiting...')
  process.exit();
});

// CLEANUP!
module.exports = {
  client: client,
  getRequestCache: _getRequestCache,
  setRequestCache: _setRequestCache,
  getCrawlRecord: _getCrawlRecord,
  setCrawlRecord: _setCrawlRecord
};