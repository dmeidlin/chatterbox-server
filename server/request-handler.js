/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');

var _messages = [
   {
    username: 'user', 
    text: 'Hello World!',
    roomname: 'lobby',
    createdAt: '2015-12-15T00:01:53.382Z'
  }
];

var requestHandler = function(request, response) {

  var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": 'application/json'
};

  var query = {

    order: function (messages, params) {
      return messages.reverse();
    },

    where: function (messages, params) {
      var processed = [];
      params = JSON.parse(params);

      for (var i = 0; i < messages.length; i++) {
        if (Date.parse(messages[i]['createdAt']) > Date.parse(params.createdAt.$gt)) {
          processed.push(messages[i]);
        }
        return processed;
      }
    } 
  };

  var handle = {

    GET: function () {
      response.writeHead(200, headers);

      var messages = _messages.slice();
      var params = url.parse(request.url, true).query;

      // {
      //   order: '-createdAt',
      //   where: '{"createdAt":{"$gt":"2015-12-15T00:01:53.382Z"}}'
      // }

      for (var key in params) {
        messages = query[key](messages, params[key]);
      }
        
      response.write(JSON.stringify({results: messages}));

      response.end();
    },

    POST: function () {
      response.writeHead(201, headers);

      request.on('data', function(chunk) {
        console.log('POST: data heard');
        dataChunk = JSON.parse(chunk);
        dataChunk.createdAt = new Date();
        _messages.push(dataChunk);
      });

      request.on('end', function() {
        console.log('POST: end');
        response.end();
      });
    },

    chatterbox: function() {
      if (handle[request.method]) {
        handle[request.method]();
      } else {
        response.writeHead(400, headers);
        response.end();
      }
    },

    '/classes/messages': function() {
      handle.chatterbox();
    },

    '/classes/room1': function() {
      handle.chatterbox();
    },

    'classes/chatterbox': function() {
      handle.chatterbox();
    }
  };

  if (request.method === 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
    return;
  }

  if (handle[url.parse(request.url).pathname]) {
    handle[url.parse(request.url).pathname]();
  } else {
    response.writeHead(404, headers);
    response.end();
  }

  console.log("Served request type " + request.method + " for url " + request.url);
};

exports.requestHandler = requestHandler;
