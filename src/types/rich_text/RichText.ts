import Annotated from '@/types/rich_text/Annotated'

export default interface RichText extends Annotated {
    text: String
    color?: String
    backgroundColorable: boolean
    href?: String
}
