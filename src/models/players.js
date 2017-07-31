'use strict';

import ottoman from '../lib/ottoman-couchbase.js';

const Player = ottoman.model('Player', {
  'publicId' : 'string',
  'balance' : 'number'
}, {
  index: {
    findById: {
      by: 'publicId'
    }
  }
});

ottoman.ensureIndices(function(err) {
  console.error(err);
});

module.exports = Player;