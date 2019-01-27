import * as React from 'react'
import {Tree} from '@blueprintjs/core'
import { IUBinTreeNode } from './uBinTreeNode'

export type UBinTreeEventHandler<T = {}> = (
  node: IUBinTreeNode<T>,
  nodePath: number[],
  e: React.MouseEvent<HTMLElement>,
) => void;

export interface IUBinTreeProps<T = {}>  {
  onNodeAdd?: UBinTreeEventHandler<T>
}

export class UBinTree<T = {}> extends Tree<IUBinTreeProps> {

}
