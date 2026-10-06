import { Suspense, useLayoutEffect } from 'react'
import { Clone, ContactShadows, Grid, OrbitControls, Outlines, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { DoubleSide, Mesh, MeshStandardMaterial } from 'three'
import { DEFAULT_TRAILER } from '../../lib/cargo'
import { DEFAULT_TRAILER_TYPE, TRAILER_TYPES, type TrailerModel } from '../../lib/trailerTypes'
import type { PackedBox, TrailerInterior } from '../../types'

for (const url of new Set(TRAILER_TYPES.map((type) => type.model.url))) useGLTF.preload(url)

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
  /** The 3D model for the selected trailer type. */
  model?: TrailerModel
  /** Marks the weight total red when the cargo is heavier than this. */
  maxWeightKg?: number | null
  className?: string
}

const LEGEND = [
  { label: 'Standard', color: '#7e3aa0' },
  { label: 'Fragile', color: '#c2410c' },
  { label: 'Not stackable', color: '#4338ca' },
  { label: 'Tiltable', color: '#0369a1' },
  { label: 'Does not fit', color: '#b42318' },
]

function Stat({ label, value, danger = false }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="px-3 py-2 sm:px-4">
      <dt className="text-[11px] font-medium tracking-[0.04em] text-ink-faint uppercase">{label}</dt>
      <dd className={`text-[15px] font-semibold tabular-nums ${danger ? 'text-danger' : 'text-ink'}`}>{value}</dd>
    </div>
  )
}

function truckScale(trailer: TrailerInterior, model: TrailerModel) {
  return trailer.length / model.cargoLength
}

function deckHeight(trailer: TrailerInterior, model: TrailerModel) {
  return truckScale(trailer, model) * (model.floorY - model.groundY)
}

function isTrailerShell(mesh: Mesh, material: MeshStandardMaterial) {
  const meshName = mesh.name
  const materialName = material.name
  return /backside/i.test(meshName) || /backside/i.test(materialName)
}

function TruckModel({ trailer, model }: { trailer: TrailerInterior; model: TrailerModel }) {
  const { scene } = useGLTF(model.url)
  const scale = truckScale(trailer, model)

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
      position={[scale * model.cargoZFront, -scale * model.groundY, -scale * model.centerX]}
    />
  )
}

function CargoMeshes({
  packed,
  selectedId,
  onSelect,
  trailer,
  model,
}: {
  packed: PackedBox[]
  selectedId: string | null
  onSelect: (id: string) => void
  trailer: TrailerInterior
  model: TrailerModel
}) {
  const deckY = deckHeight(trailer, model)
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

function Scene({
  packed,
  selectedId,
  onSelect,
  trailer,
  model = DEFAULT_TRAILER_TYPE.model,
}: Omit<LoadViewportProps, 'stats' | 'className' | 'maxWeightKg'>) {
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
          <TruckModel key={model.url} trailer={bay} model={model} />
        </Suspense>
        <CargoMeshes packed={packed} selectedId={selectedId} onSelect={onSelect} trailer={bay} model={model} />
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

export function LoadViewport({
  packed,
  selectedId,
  onSelect,
  stats,
  trailer,
  model,
  maxWeightKg = null,
  className = '',
}: LoadViewportProps) {
  const overweight = maxWeightKg !== null && stats.weight > maxWeightKg
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
        <Scene packed={packed} selectedId={selectedId} onSelect={onSelect} trailer={trailer} model={model} />
      </Canvas>

      <div className="pointer-events-none absolute top-3 left-3 hidden rounded-md border border-line bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:block">
        <p className="mb-1.5 text-[11px] font-semibold tracking-[0.06em] text-ink-faint uppercase">Legend</p>
        <ul className="grid gap-1 text-[12px] text-ink-muted">
          {LEGEND.map((entry) => (
            <li key={entry.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: entry.color }} aria-hidden="true" />
              {entry.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-end  gap-3">
        <p className="hidden rounded-md border border-line bg-white/90 px-3 py-2 text-[12px] text-ink-muted shadow-sm backdrop-blur md:block">
          Drag to rotate · Scroll to zoom · Click a box to select it
        </p>
        <dl className="text-start  grid grid-cols-4 divide-x divide-line text-[10px]  rounded-md border border-line bg-white/95 shadow-sm backdrop-blur">
          <Stat label="Boxes" value={stats.count} />
          <Stat
            label="Fitted"
            value={stats.overflow > 0 ? `${stats.fitted}/${stats.count}` : stats.fitted}
            danger={stats.overflow > 0}
          />
          <Stat
            label={maxWeightKg === null ? 'Weight' : 'Weight / limit'}
            value={
              maxWeightKg === null
                ? `${stats.weight.toFixed(0)} kg`
                : `${stats.weight.toFixed(0)} / ${Math.round(maxWeightKg).toLocaleString()} kg`
            }
            danger={overweight}
          />
          <Stat label="Volume" value={`${stats.fillPercent.toFixed(0)}%`} />
        </dl>
      </div>
    </section>
  )
}
