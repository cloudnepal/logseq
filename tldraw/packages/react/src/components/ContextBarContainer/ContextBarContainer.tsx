import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { TLBounds, BoundsUtils, TLOffset } from '@tldraw/core'
import { useCounterScaledPosition, useRendererContext } from '~hooks'
import type { TLReactShape } from '~lib'
import { useDebouncedValue } from '~hooks/useDebounced'

const stopEventPropagation = (e: React.PointerEvent) => e.stopPropagation()

export interface TLContextBarContainerProps<S extends TLReactShape> {
  shapes: S[]
  hidden: boolean
  bounds: TLBounds
  rotation?: number
}

export const ContextBarContainer = observer(function ContextBarContainer<S extends TLReactShape>({
  shapes,
  hidden: _hidden,
  bounds,
  rotation = 0,
}: TLContextBarContainerProps<S>) {
  const {
    components: { ContextBar },
    viewport: {
      bounds: vpBounds,
      camera: {
        point: [x, y],
        zoom,
      },
    },
  } = useRendererContext()
  const rBounds = React.useRef<HTMLDivElement>(null)

  const rotatedBounds = BoundsUtils.getRotatedBounds(bounds, rotation)
  const scaledBounds = BoundsUtils.multiplyBounds(rotatedBounds, zoom)

  const hidden = useDebouncedValue(_hidden, 200)

  useCounterScaledPosition(rBounds, bounds, rotation, 10003)

  if (!ContextBar) throw Error('Expected a ContextBar component.')

  const screenBounds = BoundsUtils.translateBounds(scaledBounds, [x * zoom, y * zoom])

  const offsets: TLOffset = {
    left: screenBounds.minX,
    right: vpBounds.width - screenBounds.maxX,
    top: screenBounds.minY,
    bottom: vpBounds.height - screenBounds.maxY,
    width: screenBounds.width,
    height: screenBounds.height,
  }

  const inView =
    BoundsUtils.boundsContain(vpBounds, screenBounds) ||
    BoundsUtils.boundsCollide(vpBounds, screenBounds)


  return (
    <div
      ref={rBounds}
      className="tl-counter-scaled-positioned"
      aria-label="context-bar-container"
      onPointerMove={stopEventPropagation}
      onPointerUp={stopEventPropagation}
      onPointerDown={stopEventPropagation}
    >
      <ContextBar
        hidden={hidden}
        shapes={shapes}
        bounds={bounds}
        offsets={offsets}
        scaledBounds={scaledBounds}
        rotation={rotation}
      />
    </div>
  )
})
