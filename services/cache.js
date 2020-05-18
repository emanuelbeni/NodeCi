const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

// Toggleable cache by calling .cache
mongoose.Query.prototype.cache = function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || "");
	// To make function chainable
	return this;
};

mongoose.Query.prototype.exec = async function () {
	if (!this.useCache) {
		return exec.apply(this, arguments);
	}

	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name,
		})
	);

	// If query is cached before,
	// If we have, send from query
	const cacheValue = await client.hget(this.hashKey, key);

	if (cacheValue) {
		// When returning blog post, it comes in an array of records
		// but return value must return moongose model
		const doc = JSON.parse(cacheValue);
		// Convert every item in array into moongose model
		return Array.isArray(doc)
			? doc.map((d) => new this.model(d))
			: new this.model(doc);
	}

	// issue the query and store the result in redis

	const result = await exec.apply(this, arguments);
	// Result here is a document object not JSON
	// So to store on reddis we need to convert it into JSON
	client.hmset(this.hashKey, key, JSON.stringify(result));
	return result;
};

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	},
};
