'use strict';

import Tournament from '../../models/tournament.js';
import Player from '../../models/players.js';
import httpCodes from '../../configs/httpCodes.json';
import round from 'lodash.round';

const STATUS_NEW = 0;
const STATUS_FINISHED = 1;

module.exports.announceTournament = (req, res, next) => {

	if('tournamentId' in req.query && 'deposit' in req.query) {

		let tournamentId = req.query.tournamentId;
		let deposit = req.query.deposit;

		// deposit can not be negative
		if(deposit <= 0)
		{
			res.status(httpCodes.FAIL).send('');
		}

		// finding tournament
		Tournament.findByTournamentId(tournamentId, (err, tournaments) => {

			let tournament = tournaments.length ? tournaments.pop() : null;

			// tournament found
			if(tournament)
			{
				// can not change deposit if player already joined
				// and if tournaments is not finished already
				if(tournament.players.length || tournament.status == STATUS_FINISHED)
				{
					res.status(httpCodes.FAIL).send('');
				}
				// else updating deposit summ
				else
				{
					tournament.deposit = round(deposit, 2);
					tournament.save( (err) => {
						res.status(httpCodes.OK).send('');
					});
				}
			}
			else
			{
				let tournament = new Tournament;
				tournament.publicId = tournamentId;
				tournament.deposit = round(deposit, 2);
				tournament.status = STATUS_NEW;
				tournament.players = [];
				tournament.save( (err) => {
					res.status(httpCodes.OK).send('');
				});
			}
		});
	} else {
		res.status(httpCodes.FAIL).send('');
	}
};

module.exports.joinTournament = (req, res, next) => {

	if('tournamentId' in req.query && 'playerId' in req.query) {

		let tournamentId = req.query.tournamentId,
			playerId = req.query.playerId,
			backerIds = 'backerIds' in req.query ? req.query.backerIds : [],
			player,
			tournament;

		Tournament.findByTournamentId(tournamentId, (err, tournaments) => {

			if(
				tournaments.length && (tournament = tournaments[0]) &&

				// check if player is not already joined the tournament
				(
					!tournament.players.length
					||
					tournament.players.filter((tournamnetPlayer) => {
						return tournamnetPlayer.playerId != playerId;
					}).length == tournament.players.length
				)
			) {
				Player.findById(playerId, (err, players) => {

					if(players.length && (player = players[0]))
					{
						// if player has enough money on balance
						if(player.balance >= tournament.deposit)
						{
							//saving player
							player.balance = player.balance - tournament.deposit;
							player.save( (err) => {

								// saving tournament
								tournament.players.push({playerId : playerId});
								tournament.save( (err) => {
									res.status(httpCodes.OK).send('');
								});
							});
						}
						// tournament deposit is greater
						else if(player.balance < tournament.deposit && backerIds.length)
						{
							// trying to get money from backer ids
							if(backerIds.length)
							{
								const summToCharge = tournament.deposit / (1 + backerIds.length);
								let allowtoPlay = true,
									backerIdsForCheck = backerIds.slice(),
									checkIfAllowedToPlay = () => {
										const backerId = backerIdsForCheck.pop();
										Player.findById(backerId, (err, players) => {

											let player = players[0];

											// if player found && and have enough money
											if(
												!player ||
												!('balance' in player) ||
												player.balance < summToCharge
											) {
												res.status(httpCodes.FAIL).send('');
											}
											else
											{
												// continue itteration
												if(backerIdsForCheck.length)
												{
													checkIfAllowedToPlay();
												}
												// all players are allowed to play, so charging money for tournament
												else
												{
													let backerIdsToCharge = backerIds.slice().concat([playerId]),
														savePlayer = () => {
															// done saving players
															if(!backerIdsToCharge.length)
															{
																res.status(httpCodes.OK).send('');
															}
															else
															{
																const backerId = backerIdsToCharge.pop();

																Player.findById(backerId, (err, players) => {
																	let player = players[0];
																	player.balance = round(player.balance, 2) - round(summToCharge, 2);
																	player.save( (err) => {
																		savePlayer();
																	})
																});
															}
														}

													// saving tournament
													tournament.players.push({playerId : playerId, backerIds : backerIds});
													tournament.save( (err) => {
														savePlayer();
													});
												}
											}
										});
									};

								checkIfAllowedToPlay();
							}
						}
						else
						{
							res.status(httpCodes.FAIL).send('');
						}
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
		});

	} else {
		res.status(httpCodes.FAIL).send('');
	}

};

module.exports.resultTournament = (req, res, next) => {

	if('tournamentId' in req.query) {

		let tournamentId = req.query.tournamentId,
			tournament;

		Tournament.findByTournamentId(tournamentId, (err, tournaments) => {

			if(
				tournaments.length && (tournament = tournaments[0]) && tournament.players.length && // tournament is found and has players
				tournaments.status != STATUS_FINISHED // tournament is not finished
			)
			{
				const winnerIndex = Math.ceil(Math.random()*tournament.players.length) - 1;

				let winner = tournament.players[winnerIndex],
					tournamentPlayerIds = [winner.playerId].concat(winner.backerIds && winner.backerIds.length ? winner.backerIds : []),
					prize = tournament.deposit * tournament.players.length,
					winningSumm = prize / tournamentPlayerIds.length;

				// saving
				let savePlayer = () => {
						// done saving players
						if(!tournamentPlayerIds.length)
						{
							res.status(httpCodes.OK).json({
								winners : [{
									playerId : winner.playerId,
									prize : prize
								}]
							});
						}
						else
						{
							const playerId = tournamentPlayerIds.pop();

							Player.findById(playerId, (err, players) => {
								let player = players[0];
								player.balance = round(player.balance, 2) + round(winningSumm, 2);
								player.save( (err) => {
									savePlayer();
								})
							});
						}
					}
				tournament.status = STATUS_FINISHED;
				tournament.save( (err) => {
					savePlayer();
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