var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
       res.sendFile(__dirname + "/index.html");
});

app.sessionToUser = {};


lastMessage={user: '', text: 'You are the first one here' }

io.on('connection', function(socket){
  var userId = socket.handshake.query.username;
  var room = socket.handshake.query.room
  
  app.sessionToUser[socket.id] = userId;

  socket.join(room)

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


  socket.on('chat message', function(msg){
    lastMessage = msg;
    io.to(room).emit('chat message', msg );
  });


});

var port = process.env.PORT || 3000;
http.listen(port, function(){
     console.log('listening on :' + port);
});

