var express = require('express');
app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use('/gyros', express.static(__dirname + '/node_modules/gyronorm/'));

app.get('/', function(req, res){
       res.sendFile(__dirname + "/index.html");
});
app.get('/gyro', function(req, res){
       res.sendFile(__dirname + "/gyro.html");
});



app.sessionToUser = {};


lastMessage={user: '', text: 'You are the first one here' }

io.on('connection', function(socket){
  var userId = socket.handshake.query.username;
  var room = socket.handshake.query.room
  
  app.sessionToUser[socket.id] = userId;

  socket.join(room)

  console.log("New socket is " + socket.id);
  socket.send(socket.id);
  msg = {}
  msg.text="Welcome to chat"
  msg.sessionId = socket.id
  io.to(socket.id).emit('login message', msg);

  io.to(room).emit('login message',userId + ' connected' );
  io.to(socket.id).emit('chat message', lastMessage)
 
  // who else is in the room
  io.of('/').in(room).clients((error, clients) => {
     if (error) throw error;
     console.log(room + " : " + clients)
     for (var i =0; i < clients.length; i++ ){
         console.log("     " + clients[i] + " --> " + app.sessionToUser[clients[i]]);
     }


  });
 
  socket.on('disconnect', function(){
      console.log(userId + ' disconnected');
      io.to(room).emit('login message',userId + ' left  --- ' );
  });


socket.on('private message', function(msg){
    lastMessage = msg;
    io.to(msg.dest).emit('private message', msg );
});

  socket.on('chat message', function(msg){
    lastMessage = msg;
    io.to(room).emit('chat message', msg );

    // sending to sender-client only
    //		socket.emit('message', "this is a test");
    // sending to all clients, include sender
    //		io.emit('message', "this is a test");
    // sending to all clients except sender
    //		socket.broadcast.emit('message', "this is a test");
    // sending to all clients in 'game' room(channel) except sender
    //		socket.broadcast.to('game').emit('message', 'nice game');
    // sending to all clients in 'game' room(channel), include sender
    //		io.in('game').emit('message', 'cool game');
    // sending to sender client, only if they are in 'game' room(channel)
    //		socket.to('game').emit('message', 'enjoy the game');
    // sending to all clients in namespace 'myNamespace', include sender
    //		io.of('myNamespace').emit('message', 'gg');
    // sending to individual socketid
    //		socket.broadcast.to(socketid).emit('message', 'for your eyes only');


  });


});

var port = process.env.PORT || 3000;
http.listen(port, function(){
     console.log('listening on :' + port);
});

