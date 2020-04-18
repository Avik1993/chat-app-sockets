//Imports
const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateData, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')
// File variables
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

/**
 * Ways to send event from Server -> Client OR Client => Server
 * 1. socket.emit                      - Used to transmit to all in current connection, specific client
 * 2. io.emit                          - Used to transmit to all clients
 * 3. socket.broadcast.emit            - Used to transmit to all except current client
 * VARIATIONS
 * 1. io.to.emit                        - Send to all in current room
 * 2. socket.broadcast.to.emit          - Send to all in current room except current client
 */


/**
 * Every Socket Connection has a different ID
 * that could be utilized to fetch particular 
 * connection.
 */


io.on('connection', (socket) => {
    console.log('New Websocket connection created')
    // socket.emit('message', generateData('Welcome!'))                          //sends to current connection
    // socket.broadcast.emit('message', generateData('A new user has joined!'))  //send to everybody but current connection
    // io.emit('message', 'message to be sent')                                  //send to all


    /**
     * Setup Event Listener for new joinees
     */
    socket.on('join', ({ username, room }, callback) => {
        /* Add user to particular Room */
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        /* User added to room */
        socket.join(user.room)
        socket.emit('message', generateData('Welcome!', 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateData(`${user.username} has joined!`, 'Admin'))
        
        /* Change list of users in the room */
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        
        callback()
    })


    /**
     * Setup Event Listener when 'Send' is clicked
     * Catching message for Client -> Server
     * Emitting message again on 'message' Server -> Client
     */
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity isnt allowed')
        }

        /* Fetch USer id */
        const user = getUser(socket.id)
        if (!user) {
            callback('Could not send message')
        }

        /**
         * For sending message to all except current user, use:
         * socket.broadcast.to(user.room).emit('message', generateData(message, user.username))
         */

        io.to(user.room).emit('message', generateData(message, user.username))               //send to all
        callback('Delvered')                                    //acknowledgement
    })

    socket.on('sendLocation', (location, callback) => {
        /* Fetch USer id */
        const user = getUser(socket.id)
        if (!user) {
            callback('Could not send message')
        }
        
        socket.broadcast.to(user.room).emit('broadcastLocation', generateLocationMessage(`https://google.com/maps?q=${location.lat},${location.long}`, user.username))
        callback('Location Delivered')
    })

    //RUn when connection ends
    socket.on('disconnect', () => {
        const user  = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateData(`${user.username} has left!`, 'Admin'))
            
            /* Change list of users in the room */
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

})


module.exports = server