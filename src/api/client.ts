import AxiosService from '@/api/index'
import type { AxiosRequestConfig } from 'axios'
import ClientException from '@/api/excpetion'
import type PostItem from '@/types/PostItem'

export default class Client extends AxiosService {
    constructor() {
        super('https://super-duper-space-yodel-4jrrq45vxvj2jxx-8000.app.github.dev/')
    }

    request = async (config: AxiosRequestConfig) => {
        const response = await super.request(config)
        if (response.status !== 200) {
            throw new ClientException(response)
        }
        return response.data
    }
    
    getPosts = async (): Promise<PostItem[]> => {
        return await this.request({
            method: 'GET',
            url: '/posts'
        })
    }
    
    getPost = async (post_id: string): Promise<Post> => {
        return await this.request({
            method: 'GET',
            url: '/post',
            params: {
                'post_id': post_id
            }
        })
    }
}
