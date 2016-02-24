## ioredis-etcd

ioredis for etcd, for connecting different redis dynamically.

### Install

```
npm i ioredis-etcd --save
```

### Usage

#### require('ioredis-etcd')(etcdUrl, etcdRedisConfig, _codis);

for redis:

```
var redis = require('ioredis-etcd')(['10.10.10.9:4001'], '/v1/redis');
redis
  .get('key')
  .then(console.log)
  .catch(console.error);
```

for codis:

```
var redis = require('ioredis-etcd')(['10.10.10.9:4001'], '/v1/codis', true);
redis
  .get('key')
  .then(console.log)
  .catch(console.error);
```

### Test

```
npm test
```

### License

MIT
