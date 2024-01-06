import { types } from 'node-sass'
import Annotated from '@/types/Annotated'

export default interface RichText extends Annotated {
    text: String
    color?: String
    backgroundColorable: boolean
    href?: String
}
