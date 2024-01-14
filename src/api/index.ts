import type { AxiosRequestConfig, AxiosInstance } from 'axios'
import axios from 'axios'

export default class AxiosService {
    readonly instance: AxiosInstance
    baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.instance = axios.create({
            baseURL: this.baseUrl
        })
    }

    async request(config: AxiosRequestConfig) {
        return await this.instance.request(config)
    }
    async get(config: AxiosRequestConfig) {
        return await this.instance.get(config)
    }
    async post(config: AxiosRequestConfig) {
        return await this.instance.post(config)
    }
}
