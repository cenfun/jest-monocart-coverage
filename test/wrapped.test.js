const wrapped = require('../src/wrapped');

test('test-if', () => {
    wrapped(null);
});

test('test-else', () => {
    wrapped('y');
});
