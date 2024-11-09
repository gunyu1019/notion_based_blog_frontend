import type Block from "./Block";

export default interface CodeBlock extends Block {
    language: string
}