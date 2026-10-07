import { DoubleSide } from 'three'
import type { TrailerInterior } from '../../types'

/** Floor panel thickness. The interior starts on top of this panel. */
export const CONTAINER_FLOOR = 0.06

const SKIN = 0.04
const POST = 0.08
const FRAME = '#5c4e6c'
const PANEL = '#ddd4e8'
const FLOOR = '#c9bfd4'

function Panel({
  position,
  size,
  color,
  opacity = 1,
  roughness = 0.72,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  opacity?: number
  roughness?: number
}) {
  const transparent = opacity < 1
  return (
    <mesh position={position} castShadow={!transparent} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!transparent}
        side={DoubleSide}
        metalness={transparent ? 0.04 : 0.18}
        roughness={roughness}
      />
    </mesh>
  )
}

/**
 * Cargo box built to the trailer interior. The opening is `length` × `width` × `height`,
 * with the cab-end wall just outside x = 0 and the rear open for loading.
 */
export function CargoContainer({ trailer, floorY }: { trailer: TrailerInterior; floorY: number }) {
  const { length, width, height } = trailer
  const y = floorY + height / 2
  const ribCount = Math.max(0, Math.floor((length - 0.8) / 1.25))

  return (
    <group>
      <Panel
        position={[length / 2, floorY - CONTAINER_FLOOR / 2, 0]}
        size={[length, CONTAINER_FLOOR, width]}
        color={FLOOR}
        roughness={0.9}
      />
      <Panel
        position={[length / 2, y, -(width / 2 + SKIN / 2)]}
        size={[length, height, SKIN]}
        color={PANEL}
        opacity={0.38}
      />
      <Panel
        position={[length / 2, y, width / 2 + SKIN / 2]}
        size={[length, height, SKIN]}
        color={PANEL}
        opacity={0.38}
      />
      <Panel
        position={[length / 2, floorY + height + SKIN / 2, 0]}
        size={[length, SKIN, width]}
        color={PANEL}
        opacity={0.45}
      />
      <Panel position={[-SKIN / 2, y, 0]} size={[SKIN, height, width]} color={PANEL} opacity={0.55} />

      <Panel position={[-POST / 2, y, -(width / 2)]} size={[POST, height, POST]} color={FRAME} roughness={0.46} />
      <Panel position={[-POST / 2, y, width / 2]} size={[POST, height, POST]} color={FRAME} roughness={0.46} />
      <Panel position={[length + POST / 2, y, -(width / 2)]} size={[POST, height, POST]} color={FRAME} roughness={0.46} />
      <Panel position={[length + POST / 2, y, width / 2]} size={[POST, height, POST]} color={FRAME} roughness={0.46} />

      <Panel
        position={[length / 2, floorY + height + SKIN / 2, -(width / 2)]}
        size={[length, POST, POST]}
        color={FRAME}
        roughness={0.46}
      />
      <Panel
        position={[length / 2, floorY + height + SKIN / 2, width / 2]}
        size={[length, POST, POST]}
        color={FRAME}
        roughness={0.46}
      />
      <Panel
        position={[length / 2, floorY + POST / 2, -(width / 2)]}
        size={[length, POST, POST]}
        color={FRAME}
        roughness={0.46}
      />
      <Panel
        position={[length / 2, floorY + POST / 2, width / 2]}
        size={[length, POST, POST]}
        color={FRAME}
        roughness={0.46}
      />
      <Panel
        position={[length + POST / 2, floorY + height, 0]}
        size={[POST, POST, width]}
        color={FRAME}
        roughness={0.46}
      />
      <Panel position={[length + POST / 2, floorY + POST / 2, 0]} size={[POST, POST, width]} color={FRAME} roughness={0.46} />

      {Array.from({ length: ribCount }, (_, index) => {
        const x = ((index + 1) * length) / (ribCount + 1)
        const z = width / 2 + SKIN + 0.012
        return (
          <group key={index}>
            <Panel position={[x, y, -z]} size={[0.02, height, 0.012]} color="#8a7b9c" roughness={0.55} />
            <Panel position={[x, y, z]} size={[0.02, height, 0.012]} color="#8a7b9c" roughness={0.55} />
          </group>
        )
      })}
    </group>
  )
}
