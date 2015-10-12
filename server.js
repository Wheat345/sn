
/**
 * Created by difeng on 10/4/15.
 *
 * there is main express part
 * use socket io and mysql
 */

var express = require('express');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
app.use(express.static(__dirname + '/public'));

//setup mysql

var mysql = require('mysql');
var dbconnection = mysql.createConnection({

  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'root',
  database: 'sn'

});

dbconnection.connect(function(err) {

  if (err) {
    console.error("error: " + err.stack);
    return;
  }
  console.log("connected id: " + dbconnection.threadId);
});


app.get('/notelist', function (req, res) {
  dbconnection.query('SELECT * FROM note', function (error, results, fields) {

    res.json(results);
  });

});

//
io.sockets.on('connection', function(socket) {
  socket.on('createNote', function(data) {
    socket.broadcast.emit('onNoteCreated', data);
    var post  = {
      note_position_a: data.notePositionA,
      note_position_b: data.notePositionB,
      note_name: data.noteName,
      note_content:data.noteContent,
      note_create_time:data.noteCreateTime.toString(),
      last_modification_time:data.lastModificationTime.toString(),
      status:data.noteStatus,
    };


  dbconnection.query('INSERT INTO note set ?', post, function(err,result){
    console.log(err);
    });


  });

  socket.on('loadNote', function() {

    dbconnection.query('SELECT * FROM note', function (error, results, fields) {
      socket.broadcast.emit('onNoteLoad', results);
    });

  });


  socket.on('updateNote', function(data) {
    socket.broadcast.emit('onNoteUpdated', data);
    dbconnection.query('UPDATE note SET note_content=?, note_position_a = ?, note_position_b = ? WHERE note_create_time=?', [data.noteContent, data.notePositionA, data.notePositionB, data.noteCreateTime]);
  });

  socket.on('moveNote', function(data){
    socket.broadcast.emit('onNoteMoved', data);
    dbconnection.query('UPDATE note SET note_position_a = ?, note_position_b = ? WHERE note_create_time=?', [data.notePositionA, data.notePositionB, data.noteCreateTime]);

  });

  socket.on('deleteNote', function(data){
    socket.broadcast.emit('onNoteDeleted', data);

    dbconnection.query('DELETE FROM note WHERE note_create_time = ?', [data.noteCreateTime],function (err, result) {
      if (err) throw err;

    })


  });
});

http.listen(3003);
