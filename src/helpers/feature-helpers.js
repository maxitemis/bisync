const makeDelay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { makeDelay }
