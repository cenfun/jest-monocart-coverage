function uncovered() {
    console.log('uncovered');
}

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns
 */
function sum(a, b) {

    const f = false;
    if (f) {
        uncovered();
    }

    return a + b;
}


module.exports = sum;
