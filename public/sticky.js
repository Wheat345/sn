
/**
 * Created by difeng on 10/4/15.
 *
 * there is main angularjs part
 */


var app = angular.module('myApp', []);

app.directive('stickyNote', function(socket) {
    var linker = function(scope, element, attrs) {
        element.draggable({
            stop: function(event, ui) {
                socket.emit('moveNote', {
                    noteCreateTime: scope.note.noteCreateTime,
                    notePositionA: ui.position.left,
                    notePositionB: ui.position.top
                });
            }
        });

        socket.on('onNoteMoved', function(data) {
            // Update if the same note
            if(data.noteCreateTime == scope.note.noteCreateTime) {
                element.animate({
                    left: data.notePositionA,
                    top: data.notePositionB
                });
            }
        });

        // Some DOM initiation to make it nice
        element.css('left', '10px');
        element.css('top', '50px');
        element.hide().fadeIn();
    };

    var controller = function($scope) {
        // Incoming
        socket.on('onNoteUpdated', function(data) {
            // Update if the same note
            if(data.noteCreateTime == $scope.note.noteCreateTime) {
                $scope.note.noteNme = data.noteName;
                $scope.note.noteContent = data.noteContent;
            }
        });
        // Outgoing
        $scope.updateNote = function(note) {
            socket.emit('updateNote', note);
        };
        $scope.deleteNote = function(id) {
            $scope.ondelete({
                id: id
            });
        };
    };

    return {
        restrict: 'A',
        link: linker,
        controller: controller,
        scope: {
            note: '=',
            ondelete: '&'
        }
    };
});

app.factory('socket', function($rootScope) {
    var socket = io.connect();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

app.controller('MainCtrl', function($scope, $http, socket) {
    $scope.notes = [];

    // Incoming
    socket.on('onNoteCreated', function(data) {
        $scope.notes.push(data);
    });

    //load to other broswer

    socket.on('onNoteLoad', function(data) {
        $scope.notes = [];
        for(i =0; i<data.length; i++) {
            note = {
                noteCreateTime: data[i].note_create_time,
                //title: 'old',
                //body: 'Pending',
                lastModificationTime: data[i].last_modification_time,
                noteName: data[i].note_name,
                noteContent: data[i].note_content,
                notePositionA: data[i].note_position_a,
                notePositionB: data[i].note_position_b,
                noteStatus: data[i].status,
            };
            $scope.notes.push(note);

        }


    });

    socket.on('onNoteDeleted', function(data) {
        $scope.handleDeletedNoted(data.noteCreateTime);
    });

    // Outgoing
    $scope.createNote = function() {
        var note = {
            noteCreateTime: new Date().getTime(),
            title: 'New Note',
            //body: 'Pending',
            lastModificationTime: new Date().getTime(),
            //noteName: 'New',
            //noteContent: 'write here',
            notePositionA: '10px',
            notePositionB: '50px',
            noteStatus: 'alive',
        };

        $scope.notes.push(note);
        socket.emit('createNote', note);
    };

    $scope.loadNote = function() {
            $scope.notes = [];
            $http.get('/notelist').success(function(data) {

                for(i =0; i<data.length; i++) {
                    note = {
                        noteCreateTime: data[i].note_create_time,
                        //title: 'old',
                        //body: 'Pending',
                        lastModificationTime: data[i].last_modification_time,
                        noteName: data[i].note_name,
                        noteContent: data[i].note_content,
                        notePositionA: data[i].note_position_a,
                        notePositionB: data[i].note_position_b,
                        noteStatus: data[i].status,
                    };
                    $scope.notes.push(note);

                }
            }).error(function(data, status) {
                $scope.messages = data || "Request failed";
                $scope.status = status;
            });


        socket.emit('loadNote');

    };

    $scope.deleteNote = function(id) {
        $scope.handleDeletedNoted(id);

        socket.emit('deleteNote', {noteCreateTime: id});
    };

    $scope.handleDeletedNoted = function(id) {
        var oldNotes = $scope.notes,
            newNotes = [];

        angular.forEach(oldNotes, function(note) {
            if(note.noteCreateTime !== id) newNotes.push(note);
        });

        $scope.notes = newNotes;
    }
});