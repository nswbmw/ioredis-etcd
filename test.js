'use strict';

var redis = require('./')(['10.10.10.9:4001'], '/v1/redis');

setInterval(function () {
  redis
    .get('key')
    .then(console.log)
    .catch(console.error);
}, 1000);
