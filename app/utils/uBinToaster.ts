import { Position, Toaster } from '@blueprintjs/core'

/** Singleton toaster instance. Create separate instances for different options. */
export const UBinToaster = Toaster.create({
  className: 'ubin-toaster',
  position: Position.TOP,
})