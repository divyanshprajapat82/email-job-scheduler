const { Client } = require("@elastic/elasticsearch");

const elasticClient = new Client({
	node: process.env.ELASTICSEARCH_URL,
	auth: process.env.ELASTICSEARCH_API_KEY
		? {
				apiKey: process.env.ELASTICSEARCH_API_KEY,
			}
		: undefined,
});

module.exports = elasticClient;
