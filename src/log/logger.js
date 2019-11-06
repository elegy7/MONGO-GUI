/**
 * @param {string} level
 * @param {string} text
 */
function log(level, text) {
    var args = Array.prototype.slice.call(arguments, 1)
    args = args.map(function(arg) {
        return arg instanceof Error ? arg.stack + EOL : arg
    })
    text = util.format.apply(util, args)

    var msg = {
        level: level,
        text: text,
        date: new Date()
    }

    var transports = module.exports.transports

    for (var i in transports) {
        // jshint -W089
        if (!transports.hasOwnProperty(i) || typeof transports[i] !== 'function') {
            continue
        }
        if (!compareLevels(transports[i].level, level)) {
            continue
        }

        try {
            transports[i].call(module.exports, msg)
        } catch (err) {
            console.error('Logger Error: ', err)
        }
    }
}
