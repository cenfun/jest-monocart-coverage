const wrapped = require('./wrapped');

function wrapper(a) {
    return wrapped(a);
}

module.exports = wrapper;
