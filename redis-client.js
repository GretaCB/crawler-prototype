const redis = require('redis');
const client = redis.createClient();
const {promisify} = require('util');

async function _getRequestCache(key) {
	const get = promisify(this.REQUESTCACHE.get).bind(client);
	return get(key).then(function(res) {
   		return res;
	});
}

async function _setRequestCache(key, val) {
	const set = promisify(this.REQUESTCACHE.set).bind(client);
	return set(key, val, 'EX', 36000).then(function(huh) {
		return;
	});
}

async function _getCrawlRecord(key) {
	const get = promisify(this.CRAWLSTORE.get).bind(client);
	return get(key).then(function(res) {
   		return res;
	});
}

async function _setCrawlRecord(key, val) {
	const set = promisify(this.CRAWLSTORE.set).bind(client);
	return set(key, val).then(function(huh) {
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

// CLEANUP!
module.exports = {
  client: client,
  getRequestCache: _getRequestCache,
  setRequestCache: _setRequestCache,
  getCrawlRecord: _getCrawlRecord,
  setCrawlRecord: _setCrawlRecord,
  CRAWLSTORE: redis.createClient(),
  REQUESTCACHE: redis.createClient(),
  init: function(next) {
    var select = redis.RedisClient.prototype.select;
    require('async').parallel([
      select.bind(this.CRAWLSTORE, 3),
      select.bind(this.REQUESTCACHE, 2)
    ], next);
  }
};