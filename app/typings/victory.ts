
declare module 'victory' {
  import {DomainPropType, VictoryBrushContainerProps, VictoryContainerProps} from "victory"

  export interface VictoryBrushContainerProps extends VictoryContainerProps {
    onBrushDomainChangeEnd?: (domain: DomainPropType, props: VictoryBrushContainerProps) => void;
  }
}