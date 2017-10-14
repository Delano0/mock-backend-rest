#Fork and improve
## Usage

* Mock some response (GET, POST, PUT, DELETE), if you need big response - can read it from JSON file\
* Start 
* Assert rout call results
* Stop fake server
* Or run static 

## Install
```sh
npm install -SD test-fake-server || npm i -g test-fake-server
```

```json
"dev": "test-fake-server" 
```

npm run dev 5678(port)

<img src="./screen.png" width="550"/>


```js

const FakeServer = require('test-fake-server');

const fakeServer = new FakeServer(8085);

fakeServer.port = 8085; //default port is 4000
fakeServer.get('/foo', './index.json'); //path to json file what will be response
fakeServer.post('/bar', {LOL: 'LOL'}); //
fakeServer.get('http://lol.com', { WEBLIUM_HTTP: 'WEBLIUM_HTTP' });
fakeServer.del('/foo', {LOL: 'LOL'});
fakeServer.put('/bar', {LOL: 'LOL'});
fakeServer.post('/xxx', { LOL: 'LOL' }, {error: 'SUPER CUSTOM ERROR'}, true, {a: 'a'});

fakeServer.start();

console.log(fakeServer.getGetResult('/foo')); 
//output  { called: false, callCount: 0, method: 'GET' }
//curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST http://localhost:8085/bar
//two times use curl and after
//curl -d '{"a": "a"}' -H "Content-Type: application/json" -X POST http://localhost:8085/xxx
//response will be {"LOL":"LOL"}
//curl -d '{"a": "1"}' -H "Content-Type: application/json" -X POST http://localhost:8085/xxx
//response will be {"error":"SUPER CUSTOM ERROR"}
//curl -d '{"a": "1"}' -H "Content-Type: application/json" -X POST http://localhost:8085/xxx
//response will be {"error":"SUPER CUSTOM ERROR"}

setTimeout(() => {
  console.log(fakeServer.getPostResult('/bar'));


  const callResult = fakeServer.getPostResult('/bar')
  callResult.calledWithArg({key1:"value1", key2:"value2"}) // true
  callResult.calledWithArg({key1:"value1"}) // false
  fakeServer.stop();
  fakeServer.restore();
}, 15000);
//{ calledArgs:
//   [ { key1: 'value1', key2: 'value2' },
//     { key1: 'value1', key2: 'value2' } ],
// called: true,
// callCount: 2,
// method: 'POST' }
```

methods | args
--- | --- 
**`constructor(port, responseFormat)`** | port, any or `number`, default is 4000 , `string` 'text' or 'json' (default json)
**`get(path, response, errorResponse, assertRequestBody, requestBody)`** | path: `string` example: '/foo'; response: `object` or `string` - path to json file or string response, three last args is optiona, if you want own response error errorResponse `object`, assertRequestBody `bool` if true your response body will be assert equal with last arg requestBody `object` 
**`post(path, response, errorResponse, assertRequestBody, requestBody)`** | path: `string` example: '/foo'; response: `object`or `string` - path to json file or string response, three last args is optiona, if you want own response error errorResponse `object`, assertRequestBody `bool` if true your response body will be assert equal with last arg requestBody `object` 
**`del(path, response, errorResponse, assertRequestBody, requestBody)`** | path: `string` example: '/foo'; response: `object`  or `string` - path to json file or string response, three last args is optiona, if you want own response error errorResponse `object`, assertRequestBody `bool` if true your response body will be assert equal with last arg requestBody `object` 
**`put(path, response, errorResponse, assertRequestBody, requestBody)`** | path: `string` example: '/foo'; response: `object` or `string` - path to json file or string response, three last args is optiona, if you want own response error errorResponse `object`, assertRequestBody `bool` if true your response body will be assert equal with last arg requestBody `object` 
**`start()`** | any args
**`getDelResult(path)`** | path: `string` example '/foo', if server dont have action for this path return empty obj
**`getPutResult(path)`** | path: `string` example '/foo', if server dont have action for this path return empty obj
**`getGetResult(path)`** | path: `string` example '/foo', if server dont have action for this path return empty obj
**`getPostResult(path)`** | path: `string` example '/foo', if server dont have action for this path return empty obj
**`stop()`** | any args, if server not started - will get message, after stop you can get actions results etc
**`restore()`** | any args, server to initial conditions, if server runned it method stop it
**`calledWithArg(arg)`** | called from result of action, arg `object ` return true if you call this path with arg 
## don`t need any dependencies

## Improvement plan
 * [x] Stop FakeServer
 * [x] Mock request for any url (partly) (make for http, and https)
 * [ ] Read response fron any file, and any format