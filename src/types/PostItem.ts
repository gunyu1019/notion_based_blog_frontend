import type Category from './Category'

export default interface PostItem {
    id: String
    title: String
    published_at: Date
    thumbnail_url: String
    hits: bigint
    category: Category[]
}
