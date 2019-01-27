import * as IconNames from '@blueprintjs/icons/lib/esm/generated/iconNames'

export type MaybeElement = JSX.Element | false | null | undefined;
export declare type IconName = (typeof IconNames)[keyof typeof IconNames]

export interface IProps {
  /** A space-delimited list of class names to pass along to a child element. */
  className?: string;
}

export interface IUBinTreeNode<T = {}> extends IProps {
  /**
   * Child tree nodes of this node.
   */
  childNodes?: Array<IUBinTreeNode<T>>;

  /**
   * Whether the caret to expand/collapse a node should be shown.
   * If not specified, this will be true if the node has children and false otherwise.
   */
  hasCaret?: boolean;

  /**
   * The name of a Blueprint icon (or an icon element) to render next to the node's label.
   */
  icon?: IconName | MaybeElement;

  /**
   * A unique identifier for the node.
   */
  id: string | number;

  /**
   */
  isExpanded?: boolean;

  /**
   * Whether this node is selected.
   * @default false
   */
  isSelected?: boolean;

  /**
   * The main label for the node.
   */
  label: string | JSX.Element;

  /**
   * A secondary label/component that is displayed at the right side of the node.
   */
  secondaryLabel?: string | MaybeElement;

  /**
   * An optional custom user object to associate with the node.
   * This property can then be used in the `onClick`, `onContextMenu` and `onDoubleClick`
   * event handlers for doing custom logic per node.
   */
  nodeData?: T;
}
