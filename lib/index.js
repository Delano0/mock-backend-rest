const http = require('http');
const URL = require('url');

const {
  formResult,
  parseJson,
  killServer,
  getCurrentAction,
  stringifyJson,
  assertResponse,
  assertUrl,
} = require('./util');
const deepEqual = require('./equalObj');

const initialRequest = http.request;

const formActions = (method, actions, path, response, ...args) => {
  const pathOrUrl = URL.parse(path);
  const [errorResponse, assertRequestBody, requestBody] = args;
  if (assertUrl(pathOrUrl)) {
    const mockRequest = (() => {
      http.request = ((request) => (opts, ...args) => {

        console.log(opts.url)
        return request(opts, ...args)
      })(http.request.bind(http.request));
    })();
  }
  actions.push({
    called: false,
    assertRequest: assertRequestBody || false,
    calledArgs: [],
    callCount: 0,
    method: method,
    requestBody: requestBody || {},
    errorResponse: errorResponse || { body: 'api.notfound' },
    path,
    url: pathOrUrl.hostname,
    response: assertResponse(response)
  });
  return actions;
};

const methodEnum = ['POST', 'GET', 'PUT', 'DELETE'];

const formResponse = (
  response,
  serverAction,
  method,
  pathname,
  requestBody,
  responseFormat
) => {
  if (!methodEnum.includes(method)) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(stringifyJson({ body: 'method.not.support' }));
  };
  let actinoPresent = false
  let currentAction;
  if (responseFormat == 'text') {
    serverAction.forEach((handler) => {
      if (handler.method == method && handler.path == pathname) {
        handler.called = true;
        handler.callCount++;
        !(method == 'GET') && handler.calledArgs.push(requestBody);
        actinoPresent = true;
        currentAction = handler;
      };
    });
    if (actinoPresent && currentAction) {
      try {
        if (currentAction.assertRequest) {
          const equal = deepEqual(requestBody, currentAction.requestBody)
          if (equal) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write(stringifyJson(currentAction.response))
          } else {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.write(stringifyJson(currentAction.errorResponse))
          }
        } else {
          response.writeHead(200, { 'Content-Type': 'text/plain' });
          response.write(stringifyJson(currentAction.response));
        }
      } catch (e) {
        console.error('when forma text response should be a string');
      }
    } else {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.write(stringifyJson(currentAction.errorResponse));
    };
  } else {
    serverAction.forEach((handler) => {
      if (handler.method == method && handler.path == pathname) {
        handler.called = true;
        handler.callCount++;
        !(method == 'GET') && handler.calledArgs.push(requestBody);
        actinoPresent = true;
        currentAction = handler;
      };
    });
    if (actinoPresent && currentAction) {
      if (currentAction.assertRequest) {
        const equal = deepEqual(requestBody, currentAction.requestBody)
        if (equal) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.write(stringifyJson(currentAction.response))
        } else {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.write(stringifyJson(currentAction.errorResponse))
        }
      } else {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(stringifyJson(currentAction.response));
      }
    } else {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(stringifyJson({ error: 'api.notfound' }));
    };
  };
};

class FakeServer {
  constructor(port, responseFormat) {
    this.port = port || 4000;
    this.responseFormat = responseFormat || 'json';
    this.server = undefined;
    this.runned = false;
    this.serverAction = [];
  }
  getPostResult(path) {
    return getCurrentAction(path, 'POST', this.serverAction)
  };
  getGetResult(path) {
    return getCurrentAction(path, 'GET', this.serverAction)
  };
  getPutResult(path) {
    return getCurrentAction(path, 'PUT', this.serverAction)
  };
  getDelResult(path) {
    return getCurrentAction(path, 'DELETE', this.serverAction)
  };
  put(path, response, ...args) {
    this.serverAction = formActions('PUT', this.serverAction, path, response, ...args);
  };
  post(path, response, ...args) {
    this.serverAction = formActions('POST', this.serverAction, path, response, ...args);
  };
  get(path, response, ...args) {
    this.serverAction = formActions('GET', this.serverAction, path, response, ...args);
  };
  del(path, response, ...args) {
    this.serverAction = formActions('DELETE', this.serverAction, path, response, ...args);
  };
  start() {
    this.runned = true;
    this.server = http.createServer((request, response) => {
      let requestBody = ''
      const url = URL.parse(request.url);
      const METHOD = request.method;
      const pathname = url.pathname;

      request.on('data', (chunk) => {
        requestBody += chunk.toString('utf8');
      }).on('end', () => {
        try {
          requestBody = !(METHOD == 'GET') ? parseJson(requestBody) : '';
          formResponse(response, this.serverAction, METHOD, pathname, requestBody, this.responseFormat);
          response.end();
        } catch (error) {
          console.error(error);
        }
      });

    }).listen(this.port
      ? this.port
      : 4000);
  };
  stop() {
    try {
      killServer(FakeServer.server).kill();
    } catch (e) {
      console.error('Server not started');
    };
  };
  restore() {
    killServer(this.server).kill();
    this.port = undefined;
    this.runned = false;
    this.serverAction = [];
    this.server = undefined;
    http.request = initialRequest;
  };
};

module.exports = FakeServer;
