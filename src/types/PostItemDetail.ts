import type { BlockResponse } from "./block"
import type PostItem from "./PostItem"

export default interface PostItemDetail extends PostItem {
    content: BlockResponse 
}
