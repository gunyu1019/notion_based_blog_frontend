import type Category from './Category'

export default interface PostItem {
    id: string
    title: string
    published_at: Date
    thumbnail_url: string
    hits: bigint
    category: Category[]
}
