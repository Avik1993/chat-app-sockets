const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    /* Validate Incoming data */
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }    
    }

    /* Check for existing User */
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: `${username} is in use, for Chat Room ${room}!`
        }
    }

    /* Add user after all validation */
    const user = {id, username, room}
    users.push(user)
    return {
        user: user
    }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    /* Validating User was found */
    if (index !== -1) {
        /* 
         * Splice (Remove) from index and remove only 1 user
         * Splice function - returns array of all removed objects
         * We are hardcoding '0' because we are always removing 
         * only 1 user per call. 
         */
        return users.splice(index, 1)[0]   
    }
}



const getUser = (id) => {
    return users.find((user) => user.id === id)
}



const getUserInRoom = (room) => {
    return users.filter((user) => user.room === room)
}



/* 
 *  Exporting functions 
 */
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}