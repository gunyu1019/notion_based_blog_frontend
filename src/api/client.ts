import AxiosService from '@/api/index'
import type { AxiosRequestConfig } from 'axios'
import ClientException from '@/api/excpetion'
import type PostItem from '@/types/PostItem'

export default class Client extends AxiosService {
    constructor() {
        super('/api')
    }

    request = async (config: AxiosRequestConfig) => {
        const response = await super.request(config)
        if (response.status !== 200) {
            throw new ClientException(response)
        }
        return response.data
    }
    getPosts = async (): PostItem => {
        return await this.request({
            method: 'GET',
            url: '/posts/'
        })
    }
}
