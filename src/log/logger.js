const logger = require('electron-logger')

export default function(error) {
    console.log('error', error)
    logger.info(error.stack)

    logger.setLevel('error')
    logger.setLevel(1)

    logger.getLevel()

    logger.close()
    logger.pause()
    logger.open()

    logger.setOutput({ file: './error.log' })
}
