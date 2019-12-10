const {promisify} = require('util');
const redis = require('redis');
const client = redis.createClient({
	host: 'redis-server',
    port: 6379
});

async function _getRequestCache(key) {
	const get = promisify(client.get).bind(client);
	return get(key).then(function(res) {
   		return res;
	});
}

async function _setExRequestCache(key, val) {
	const set = promisify(client.set).bind(client);
	return set(key, val, 'EX', 36000).then(function(res) {
		return;
	});
}

async function _getCrawlRecord(key) {
	const get = promisify(client.get).bind(client);
	return get(key).then(function(res) {
   		return res;
	});
}

async function _setCrawlRecord(key, val) {
	const set = promisify(client.set).bind(client);
	return set(key, val).then(function(res) {
		return;
	});
}

client.on('error', (err) => {
  console.log(err);
});

client.on('ready', () => {
	// console.log('Flushing all DBs for fresh start (only use for prototype)...');
	//client.flushall();
	console.log('Redis is ready!');
});

client.on('end', () => {
  console.log('Redis says goodbye!');
  console.log('Crawler process exiting...')
  process.exit();
});

module.exports = {
  getRequestCache: _getRequestCache,
  setExRequestCache: _setExRequestCache,
  getCrawlRecord: _getCrawlRecord,
  setCrawlRecord: _setCrawlRecord,
  client: client
};