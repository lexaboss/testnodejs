'use strict';

module.exports = (req, res, next) => {

	// response auto headers
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'GET, POST');
	res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.set('Access-Control-Max-Age', '0');

	next();
};