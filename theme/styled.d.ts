import 'styled-components/native';
import { DomainTheme } from './domainThemes';

declare module 'styled-components/native' {
    export interface DefaultTheme extends DomainTheme { }
}
