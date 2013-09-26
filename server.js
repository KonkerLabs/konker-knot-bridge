var config = require('./config');
var restify = require('restify');
var socketio = require('socket.io');

var server = restify.createServer();
var io = socketio.listen(server);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

io.sockets.on('connection', function (socket) {
  // var sockets = require('./lib/sockets')(socket);

  console.log('websocket connection detected');
  
  socket.emit('identify', { socketid: socket.id.toString() });
  socket.on('identity', function (data) {
          console.log(data);
          require('./lib/updateSocketId')(data)
  });

  socket.on('disconnect', function (data) {
          console.log(data);
          require('./lib/updatePresence')(socket.id.toString())
  });


  // curl http://localhost:3000/status
  server.get('/status', require('./lib/getSystemStatus'));

  // curl http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
  server.get('/devices', require('./lib/getDevices'));

  // curl http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
  server.get('/devices/:uuid', require('./lib/whoami'));

  // curl -X POST -d "name=arduino&description=this+is+a+test" http://localhost:3000/devices
  server.post('/devices', require('./lib/register'));

  // curl -d "online=true" http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
  server.put('/devices/:uuid', require('./lib/updateDevice'));

  // curl -X DELETE http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
  server.del('/devices/:uuid', require('./lib/unregister'));

  server.post('/messages/:uuid', function(req, res, next){

      if(req.params.uuid = "all"){

          var body = req.body;
          console.log('message: ' + body);
          io.sockets.emit('message', JSON.parse(body));
          res.json({socketid: "all", body: JSON.parse(body)});

      } else {

        require('./lib/getSocketId')(req.params.uuid, function(data){
          // console.log('callback = ' + data);
          // var body = req.body.gsub("'", '"');
          var body = req.body;
          console.log('message: ' + body);
          io.sockets.socket(data).emit('message', JSON.parse(body));
          res.json({socketid: data, body: JSON.parse(body)});
        });

      }


  });

});


// // curl http://localhost:3000/status
// server.get('/status', require('./lib/getSystemStatus'));

// // curl http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
// server.get('/devices', require('./lib/getDevices'));

// // curl http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
// server.get('/devices/:uuid', require('./lib/whoami'));

// // curl -X POST -d "name=arduino&description=this+is+a+test" http://localhost:3000/devices
// server.post('/devices', require('./lib/register'));

// // curl -d "online=true" http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
// server.put('/devices/:uuid', require('./lib/updateDevice'));

// // curl -X DELETE http://localhost:3000/devices/01404680-2539-11e3-b45a-d3519872df26
// server.del('/devices/:uuid', require('./lib/unregister'));

// server.post('/messages/:uuid', require('./lib/sendMessage'));



// io.sockets.on('connection', function (socket) {
//   console.log('websocket connection detected');
  
//   socket.emit('identify', { socketid: socket.id.toString() });
//   socket.on('identity', function (data) {
//           console.log(data);
//           require('./lib/updateSocketId')(data)
//   });

//   socket.on('disconnect', function (data) {
//           console.log(data);
//           require('./lib/updatePresence')(socket.id.toString())
//   });


// });

// server.listen(8080, function () {
//     console.log('socket.io server listening at %s', server.url);
// });
server.listen(process.env.PORT || config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});