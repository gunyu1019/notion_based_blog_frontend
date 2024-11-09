import type Block from "./Block";

export default interface TableBlock extends Block {
    has_row_header: boolean
    has_column_header: boolean
    width: number
    height: number
}