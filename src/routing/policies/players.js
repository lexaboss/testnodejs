'use strict';

import Player from '../../models/players.js';
import httpCodes from '../../configs/httpCodes.json';

module.exports.take = (req, res, next) => {

	if('playerId' in req.query && 'points' in req.query) {

		let playerId = req.query.playerId,
			points = req.query.points;

		// can not take negative points
		if(points <= 0)
		{
			res.status(httpCodes.FAIL).send('');
		}

		// finding player
		Player.findById(playerId, (err, players) => {

			let player;

			// balance is big enough
			if(players.length && (player = players[0]).balance >= points)
			{
				player.balance = parseInt(player.balance) - parseInt(points);
				player.save( (err) => {
					res.status(httpCodes.OK).send('');
				});
			}
			else
			{
				res.status(httpCodes.FAIL).send('');
			}

		});
	}
	else
	{
		res.status(httpCodes.FAIL).send('');
	}
};

module.exports.fund = (req, res, next) => {

	if('playerId' in req.query && 'points' in req.query) {

		let playerId = req.query.playerId,
			points = req.query.points;

		// can not add negative points
		if(points <= 0)
		{
			res.status(httpCodes.FAIL).send('');
		}

		// finding player
		Player.findById(playerId, (err, players) => {

			// creating new player
			if(!players.length)
			{
				let player = new Player;
				player.publicId = playerId;
				player.balance = parseInt(points);
				player.save( (err) => {
					res.status(httpCodes.OK).send('');
				});
			}
			// updating existing
			else
			{
				let player = players[0];
				player.balance = parseInt(player.balance) + parseInt(points);
				player.save( (err) => {
					res.status(httpCodes.OK).send('');
				});
			}

		});
	} else {
		res.status(httpCodes.FAIL).send('');
	}
};

module.exports.balance = (req, res, next) => {

	if('playerId' in req.query) {

		let playerId = req.query.playerId;

		// finding player
		Player.findById(playerId, (err, players) => {

			res.status(httpCodes.OK).json({
				playerId : playerId,
				balance : players[0].balance
			});
		});
	} else {
		res.status(httpCodes.FAIL).send('');
	}
};