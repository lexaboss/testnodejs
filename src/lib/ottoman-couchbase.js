const couchbase = require("couchbase");
const ottoman = require("ottoman");

let cluster = new couchbase.Cluster("http://172.17.0.2");
ottoman.store = new ottoman.CbStoreAdapter(cluster.openBucket('default'), couchbase);

module.exports = ottoman;