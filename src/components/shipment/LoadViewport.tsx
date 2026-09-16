import { Suspense, useLayoutEffect } from 'react'
import { Clone, ContactShadows, Grid, OrbitControls, Outlines, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { DoubleSide, Mesh, MeshStandardMaterial } from 'three'
import { DEFAULT_TRAILER } from '../../lib/cargo'
import type { PackedBox, TrailerInterior } from '../../types'

/** Low Poly Truck by FS 3D Studio, CC-BY-4.0 — https://sketchfab.com/3d-models/low-poly-truck-d61a2ac0a706462ebf82459907f21573 */
const TRUCK_GLB = '/models/long_truck1_transparent.glb'

useGLTF.preload(TRUCK_GLB)

/**
 * Measured cargo box of the Sketchfab GLB after its baked Y-up transform.
 * Length runs along −Z (cab toward +Z), width along X, wheels sit near groundY.
 */
const MODEL = {
  cargoZFront: 1.2191,
  cargoLength: 16.4197,
  centerX: 8.3057,
  groundY: 0.3494,
  floorY: 2.1073,
}

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

function truckScale(trailer: TrailerInterior) {
  return trailer.length / MODEL.cargoLength
}

function deckHeight(trailer: TrailerInterior) {
  return truckScale(trailer) * (MODEL.floorY - MODEL.groundY)
}

function isTrailerShell(mesh: Mesh, material: MeshStandardMaterial) {
  const meshName = mesh.name
  const materialName = material.name
  return /backside/i.test(meshName) || /backside/i.test(materialName)
}

function TruckModel({ trailer }: { trailer: TrailerInterior }) {
  const { scene } = useGLTF(TRUCK_GLB)
  const scale = truckScale(trailer)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      object.castShadow = true
      object.receiveShadow = true
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        if (!(material instanceof MeshStandardMaterial)) continue
        if (!isTrailerShell(object, material)) continue
        material.transparent = true
        material.opacity = Math.min(material.opacity, 0.22)
        material.depthWrite = false
        material.side = DoubleSide
      }
    })
  }, [scene])

  return (
    <Clone
      object={scene}
      castShadow
      receiveShadow
      scale={scale}
      rotation={[0, -Math.PI / 2, 0]}
      position={[scale * MODEL.cargoZFront, -scale * MODEL.groundY, -scale * MODEL.centerX]}
    />
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
  const deckY = deckHeight(trailer)
  return (
    <group>
      {packed.map((box) => {
        const selected = box.item.id === selectedId
        const y = box.fitted ? deckY + box.y + box.height / 2 : box.height / 2
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
        <Suspense fallback={null}>
          <TruckModel trailer={bay} />
        </Suspense>
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
        camera={{ position: [8.2, 6.1, 14.4], fov: 38, near: 0.1, far: 90 }}
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
