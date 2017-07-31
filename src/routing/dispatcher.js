'use strict';

import routingPolicies from '../configs/routingPolicies.json';
import lcfirst from '../lib/lcfirst.js';
import express from 'express';

module.exports = new class RoutingService extends express.Router {

	constructor() {
		super();

		let self = this;

		this.use(function(req, res, next) {

			// normalizing method name based on url
			let methodName = lcfirst(req.url.split('?')[0].split('/').map(function(slice){
				return (slice.charAt(0).toUpperCase() + slice.substr(1)).replace(/[^a-zA-Z]+/gi, "");
			}).join(''));

			// request method in lowercase
			let requestMethod = req.method.toLowerCase();

			// redirecting to model methods using routing policy stored in format:
			// { get|post } => {{ url => model }, ..}
			if(
				requestMethod in routingPolicies &&				// if requestMethod is allowed
				methodName in routingPolicies[requestMethod]	// if routing policy is defined
			) {
				let modelName = routingPolicies[requestMethod][methodName];
				let modelRoutingPolicies = require('./policies/' + modelName + '.js');

				self[requestMethod]('/' + methodName, modelRoutingPolicies[methodName]);
			}

		    next();
		});
	}
}