import { ContactShadows, Grid, OrbitControls, Outlines } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { DECK_HEIGHT, DEFAULT_TRAILER } from '../../lib/cargo'
import type { PackedBox, TrailerInterior } from '../../types'

type LoadViewportProps = {
  packed: PackedBox[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  stats: {
    count: number
    fitted: number
    overflow: number
    weight: number
    fillPercent: number
  }
  trailer?: TrailerInterior
  className?: string
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.51, 0.51, 0.36, 24]} />
        <meshStandardMaterial color="#171717" roughness={0.88} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.38, 18]} />
        <meshStandardMaterial color="#a8a8b0" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  )
}

function Tractor() {
  const track = 1.05
  return (
    <group position={[-3.92, 0, 0]}>
      <mesh position={[1.75, 0.9, 0]} castShadow>
        <boxGeometry args={[3.5, 0.22, 0.9]} />
        <meshStandardMaterial color="#1f1f23" roughness={0.55} />
      </mesh>
      <mesh position={[0.12, 0.58, 0]} castShadow>
        <boxGeometry args={[0.28, 0.32, 2.46]} />
        <meshStandardMaterial color="#8a8a93" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0.82, 1.22, 0]} castShadow>
        <boxGeometry args={[1.28, 0.78, 2.38]} />
        <meshStandardMaterial color="#3d0a58" roughness={0.42} />
      </mesh>
      <mesh position={[2.28, 2.02, 0]} castShadow>
        <boxGeometry args={[1.82, 1.88, 2.44]} />
        <meshStandardMaterial color="#490a67" roughness={0.4} />
      </mesh>
      <mesh position={[2.22, 3.08, 0]} castShadow>
        <boxGeometry args={[1.55, 0.28, 2.18]} />
        <meshStandardMaterial color="#2f0742" roughness={0.45} />
      </mesh>
      <mesh position={[1.38, 2.12, 0]} rotation={[0, 0, -0.38]}>
        <planeGeometry args={[1.15, 1.05]} />
        <meshStandardMaterial
          color="#9fd6ef"
          transparent
          opacity={0.38}
          metalness={0.85}
          roughness={0.08}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[2.25, 2.15, 1.23]}>
        <planeGeometry args={[1.15, 0.7]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.45} metalness={0.7} roughness={0.12} />
      </mesh>
      <mesh position={[2.25, 2.15, -1.23]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.15, 0.7]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.45} metalness={0.7} roughness={0.12} />
      </mesh>
      <mesh position={[-0.02, 0.78, 0.82]}>
        <boxGeometry args={[0.1, 0.16, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#fde68a" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.02, 0.78, -0.82]}>
        <boxGeometry args={[0.1, 0.16, 0.28]} />
        <meshStandardMaterial color="#f8fafc" emissive="#fde68a" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[3.05, 1.35, -1.08]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.7, 12]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[1.55, 0.78, 0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.15, 16]} />
        <meshStandardMaterial color="#27272a" roughness={0.5} />
      </mesh>
      <Wheel position={[0.62, 0.51, track]} />
      <Wheel position={[0.62, 0.51, -track]} />
      <Wheel position={[2.58, 0.51, track]} />
      <Wheel position={[2.58, 0.51, -track]} />
      <Wheel position={[3.28, 0.51, track]} />
      <Wheel position={[3.28, 0.51, -track]} />
    </group>
  )
}

function TrailerBody({ trailer }: { trailer: TrailerInterior }) {
  const { length, width, height } = trailer
  const wall = 0.07
  const exterior = width + 0.08
  const deckY = DECK_HEIGHT
  const centerX = length / 2
  const wallH = height + 0.12
  const track = exterior / 2 - 0.18

  return (
    <group>
      <mesh position={[-0.18, deckY - 0.06, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.16, 24]} />
        <meshStandardMaterial color="#52525b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[centerX, deckY - 0.16, 0]} castShadow>
        <boxGeometry args={[length, 0.18, exterior]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.65} />
      </mesh>
      <mesh position={[centerX, deckY + 0.015, 0]} receiveShadow>
        <boxGeometry args={[length - 0.04, 0.05, width]} />
        <meshStandardMaterial color="#9a8b78" roughness={0.9} />
      </mesh>
      <mesh position={[wall / 2, deckY + wallH / 2, 0]} castShadow>
        <boxGeometry args={[wall, wallH, exterior]} />
        <meshStandardMaterial color="#ece8f0" roughness={0.48} />
      </mesh>
      <mesh position={[centerX, deckY + wallH / 2, -exterior / 2 + wall / 2]} castShadow>
        <boxGeometry args={[length, wallH, wall]} />
        <meshStandardMaterial color="#f4f1f6" roughness={0.5} />
      </mesh>
      <mesh position={[centerX, deckY + height + 0.08, 0]}>
        <boxGeometry args={[length, 0.06, exterior]} />
        <meshStandardMaterial color="#d6d0dc" transparent opacity={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[length - 0.05, deckY + wallH / 2, -0.62]} rotation={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.06, wallH - 0.1, 1.18]} />
        <meshStandardMaterial color="#e7e2ec" roughness={0.46} />
      </mesh>
      <mesh position={[1.55, 0.62, 0.38]} castShadow>
        <boxGeometry args={[0.1, 1.1, 0.1]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[1.55, 0.62, -0.38]} castShadow>
        <boxGeometry args={[0.1, 1.1, 0.1]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.4} roughness={0.4} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[(length / 9) * (index + 1), deckY + wallH / 2, -exterior / 2 + 0.02]}>
          <boxGeometry args={[0.05, wallH - 0.1, 0.04]} />
          <meshStandardMaterial color="#d8d0e0" roughness={0.4} />
        </mesh>
      ))}
      <Wheel position={[length - 2.05, 0.51, track]} />
      <Wheel position={[length - 2.05, 0.51, -track]} />
      <Wheel position={[length - 1.25, 0.51, track]} />
      <Wheel position={[length - 1.25, 0.51, -track]} />
    </group>
  )
}

function CargoMeshes({
  packed,
  selectedId,
  onSelect,
  trailer,
}: {
  packed: PackedBox[]
  selectedId: string | null
  onSelect: (id: string) => void
  trailer: TrailerInterior
}) {
  return (
    <group>
      {packed.map((box) => {
        const selected = box.item.id === selectedId
        const y = box.fitted ? DECK_HEIGHT + box.y + box.height / 2 : box.height / 2
        const x = box.x + box.length / 2
        const z = box.z + box.width / 2 - trailer.width / 2
        return (
          <mesh
            key={box.item.id}
            position={[x, y, z]}
            castShadow
            receiveShadow
            onClick={(event) => {
              event.stopPropagation()
              onSelect(box.item.id)
            }}
          >
            <boxGeometry args={[box.length, box.height, box.width]} />
            <meshStandardMaterial
              color={box.fitted ? box.color : '#b42318'}
              roughness={0.48}
              metalness={0.04}
              emissive={selected ? (box.fitted ? box.color : '#b42318') : '#000000'}
              emissiveIntensity={selected ? 0.22 : 0}
              transparent={!box.fitted}
              opacity={box.fitted ? 1 : 0.85}
            />
            {selected ? <Outlines thickness={3.5} color="#f5d0a9" /> : null}
          </mesh>
        )
      })}
    </group>
  )
}

function Scene({ packed, selectedId, onSelect, trailer }: Omit<LoadViewportProps, 'stats' | 'className'>) {
  const bay = trailer ?? DEFAULT_TRAILER
  return (
    <>
      <color attach="background" args={['#efeaf3']} />
      <fog attach="fog" args={['#efeaf3', 22, 48]} />
      <hemisphereLight args={['#fff7ff', '#b7a4c2', 0.55]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[10, 16, 9]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={48}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-8, 6, -6]} intensity={0.28} color="#c4b5d6" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#e7e2ec" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.45}
        cellColor="#d3cbd8"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#b9adc4"
        fadeDistance={36}
        fadeStrength={1.2}
        infiniteGrid
      />
      <group position={[-bay.length / 2, 0, 0]}>
        <Tractor />
        <TrailerBody trailer={bay} />
        <CargoMeshes packed={packed} selectedId={selectedId} onSelect={onSelect} trailer={bay} />
      </group>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={40} blur={2.4} far={12} />
      <OrbitControls
        makeDefault
        enableDamping
        target={[0, 1.55, 0]}
        minDistance={7}
        maxDistance={34}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  )
}

export function LoadViewport({ packed, selectedId, onSelect, stats, trailer, className = '' }: LoadViewportProps) {
  return (
    <section className={`relative h-full min-h-0 min-w-0 overflow-hidden bg-[#efeaf3] ${className}`} aria-label="Trailer load visualization">
      <Canvas
        className="h-full touch-none"
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [7.4, 5.6, 13.2], fov: 38, near: 0.1, far: 90 }}
        onPointerMissed={() => onSelect(null)}
      >
        <Scene packed={packed} selectedId={selectedId} onSelect={onSelect} trailer={trailer} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        <p className="rounded-lg bg-white/80 px-3 py-2 text-[12px] text-ink-muted shadow-sm backdrop-blur">
          Drag to orbit · scroll to zoom
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-white/85 px-3 py-2 text-[12px] text-ink-muted shadow-sm backdrop-blur sm:grid-cols-4">
          <div>
            <dt className="text-[10px] tracking-wide uppercase">Cargo</dt>
            <dd className="font-semibold text-ink">{stats.count}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-wide uppercase">Fitted</dt>
            <dd className="font-semibold text-ink">
              {stats.overflow > 0 ? `${stats.fitted}/${stats.count}` : stats.fitted}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-wide uppercase">Weight</dt>
            <dd className="font-semibold text-ink">{stats.weight.toFixed(0)} kg</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-wide uppercase">Fill</dt>
            <dd className="font-semibold text-ink">{stats.fillPercent.toFixed(0)}%</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
