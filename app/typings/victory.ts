
declare module 'victory' {
  import {DomainPropType} from "victory"

  export interface VictoryBrushContainerProps {
    onBrushDomainChangeEnd?: (domain: DomainPropType, props: VictoryBrushContainerProps) => void;
  }
}