
function generateGuid(length) {
    let string = '';
    for (let i = 0; i < (length || 20); i++) {
        string += Math.floor(Math.random(9) * 9);
    }
    return string;
}

module.exports = { generateGuid };