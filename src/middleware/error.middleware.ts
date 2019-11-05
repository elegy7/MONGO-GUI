import { NextFunction, Request, Response } from 'express'
import HttpException from '../exceptions/HttpException'

function errorMiddleware(
    error: HttpException,
    request: Request,
    response: Response,
    next: NextFunction
) {
    console.log('middleware error', error)
    const status = error.status || 200
    const message = error.message || 'Something went wrong'
    // 判断是否已经响应, 避免多次响应报错
    if (response.headersSent) return

    response.status(status).send({
        message,
        status
    })
}

export default errorMiddleware
