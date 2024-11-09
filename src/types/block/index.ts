import type Block from "./Block";
import type CodeBlock from "./CodeBlock";
import type TableBlock from "./TableBlock";
import type UrlBlock from "./UrlBlock";

export type SpecialBlock = CodeBlock | TableBlock | UrlBlock;
export type BlockResponse = Block | SpecialBlock;