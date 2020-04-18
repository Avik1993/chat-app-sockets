const generateData = (message, username) => {
    console.log(`Generating data with username ${username}`)
    return {
        text: message,
        createdAt: new Date().getTime(),
        username: username
    }
}

const generateLocationMessage = (url, username) => {
    console.log(`Generating Location feed for username ${username}`)
    return {
        url: url,
        createdAt: new Date().getTime(),
        username: username
    }
}

module.exports = {
    generateData,
    generateLocationMessage
}