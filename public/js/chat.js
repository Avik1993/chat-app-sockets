/* This file acts as Client making calls to Server 
*  When only backend is written, this need not be implemented
*/

/* This is calling from Client side to make a Websocket connection
*  io function is used to connect.
*  When this is called, server side's `io.on('connection')` is called
*  As usinng `io()` we are trying to make connection from client side.
*/
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationFormButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTempalte = document.querySelector('#sidebar-template').innerHTML

// Options
/**
 * This will convert the query parameter when user joins a Chat room
 * Convert ?username=Avik&Room=Rooom1 to 
 * location.search.username=Avik
 * location.search.Room=Room1
 */
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})


/**
 * Scrolling
 */
const autoscroll = () => {
    // Get New Element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMarging = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarging

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


/**
 * Event Listener when messages sent from Server -> Client on idenfitier 'message'
 */
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A'),                               // Passing message coming into template
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


/**
 * Event Listener when Location sent from Server -> Client.
 */
socket.on('broadcastLocation', (location) => {
    const html = Mustache.render(locationTemplate, {
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm A'),
        username: location.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


/**
 * Event Listener for HTML FORM,
 * This is used to send data from Client -> messages
 */
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()                                          // to prevent refrsh
    // const message = document.querySelector('input').value    //Method 1
    
    //Disable button till the time, previous is ack
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value             //Method 2
    
    /*
    * emit accepts last agument which gets called when client send acknowledgement
    */
    socket.emit('sendMessage', message, (error) => {
        //Enable button once ack
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})


/**
 * Event listener when User clicks on 'Send Location' Button
 * Used to send location from Client -> Server -> Every Other Client
 */
document.querySelector("#send-location").addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser')
    }
    /* 
     *  Not Responding
     *  navigator.geolocation.getCurrentPosition((position) => {
     *    console.log(position)
     *  })
     */
    $locationFormButton.setAttribute('disabled', 'disabled')
    const lat = 95
    const long = 29
    /**
     * Sending location from Client -> Server on identifier 'sendLocation'
     */
    socket.emit('sendLocation', {lat, long}, (message) => {
        console.log(message)
        //Enable location button
        $locationFormButton.removeAttribute('disabled')
    })

})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})



/**
 * Add Event Listener for whenever 
 * User Joins/Disconnects from room
 * User list in left side bar will be updated
 */
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTempalte, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})