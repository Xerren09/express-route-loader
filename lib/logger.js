const logger = {
    info (message, data="") {
        console.info(message);
        if (data)
        {
            console.info(data);
        }
    },
    warn (message, data) {
        console.warn(message);
        if (data)
        {
            console.warn(data);
        }
    },
    error (message, data) {
        console.error(message);
        if (data)
        {
            console.error(data);
        }
    }
}

module.exports = logger;