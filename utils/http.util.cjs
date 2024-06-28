class HTTPUtils {
    constructor(req, res, next = undefined) {
        this.req = req
        this.res = res
        this.next = next
    }

    send_status(status) {
        return this.res.sendStatus(status)
    }

    send_json(status = 500, data) {
        return this.res.status(status).json(data)
    }

    send_message(status = 500, message) {
        return this.res.status(status).json({ message: message })
    }

    send_file(status = 500, filePath, err_callback) {
        return this.res.status(status).download(filePath, err_callback)
    }

    send_page(status = 500, filePath) {
        return this.res.status(status).sendFile(filePath)
    }

    set_cookie(cookie_name, cookie, options) {
        this.res.cookie(cookie_name, cookie, options)

        return this
    }

    delete_cookie(cookie_name) {
        this.res.clearCookie(cookie_name)

        return this
    }

    redirect(status = 500, url) {
        return this.res.status(status).redirect(url)
    }
}

module.exports = HTTPUtils