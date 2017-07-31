'use strict';

import ottoman from '../lib/ottoman-couchbase.js';

const Tournament = ottoman.model('Tournament', {
  'publicId' : 'number',
  'deposit' : 'number',
  'status' : 'number',
  'players' : [{
    playerId: 'string',
    backerIds: ['string']
  }]
}, {
  index: {
    findByTournamentId: {
      by: 'publicId'
    }
  }
});

ottoman.ensureIndices(function(err) {
  console.error(err);
});

module.exports = Tournament;