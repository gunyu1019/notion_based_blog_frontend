import type RichText from "../rich_text/RichText"

export default interface Block {
    id: string
    type: string

    has_children: boolean
    children: Block[]

    text: RichText[]
    captions: RichText[]
    is_file_available: boolean
}
