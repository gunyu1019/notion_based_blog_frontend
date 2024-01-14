import type { AxiosResponse } from 'axios'

export default class ClientException<T = any, D = any> implements Error, AxiosResponse<T, D> {
    constructor(
        response: AxiosResponse<T>,
        name?: string = null,
        message?: string = null,
        stack?: string = null
    ) {
        this.data = response.data
        this.status = response.status
        this.statusText = response.statusText
        this.config = response.config
        this.request = response.request

        this.name = name !== null ? name : 'ClientException'
        this.message = message !== null ? message : `${this.statusText} (${this.status})`
        this.stack = stack
    }
}
