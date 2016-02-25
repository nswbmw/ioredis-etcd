'use strict';

var _ = require('lodash');
var Etcd = require('node-etcd');
var Redis = require('ioredis');
var commands = require('ioredis-commands');
var redis = {};

module.exports = function (etcdUrl, etcdRedisConfig, _opts, _codis) {
  if (arguments.length < 2) {
    throw new TypeError('Missing etcdUrl or etcdRedisConfig');
  }

  var etcd = new Etcd(etcdUrl);
  connectNewRedis();
  var watcher = etcd.watcher(etcdRedisConfig, null, { recursive: true });
  watcher.on('change', function () {
    connectNewRedis();
  });

  function connectNewRedis() {
    var res = etcd.getSync(etcdRedisConfig, { recursive: true });
    var nodes = (res.body && res.body.node && res.body.node.nodes) || [];
    var urls = nodes.map(function (node) {
      return node.value;
    });
    if (_codis) {
      if ('function' === typeof _codis) {
        urls = _codis(urls);
      } else {
        urls = defaultCodisStrategy(urls);
      }
    }
    console.log('redis urls: %j', urls);
    if (!urls.length) {
      console.error('No available redis url');
      return;
    }

    var url = urls[Math.floor(Math.random() * urls.length)];
    console.log('connect: %s', url);
    url = formatUrl(url);

    var newRedis = new Redis(url.port, url.host, _opts);
    Object.keys(commands).forEach(function (command) {
      redis[command] = newRedis[command].bind(newRedis);
    });

    try {
      redis.disconnect();
    } catch (e) {}

    redis.newRedis= newRedis;
    redis.disconnect = newRedis.disconnect.bind(newRedis);
  }
  return redis;
};

function formatUrl(url) {
  var arr = url.split(':');
  return {
    host: arr[0],
    port: arr[1]
  };
}

function defaultCodisStrategy(urls) {
  return _.chain(urls)
    .map(JSON.parse)
    .filter(function (url) {
      return (url.state === 'online') && (new Date() - new Date(url.start_at) > 300000);
    })
    .map('addr')
    .value();
}