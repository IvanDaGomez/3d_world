import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DebrisItem {
  mesh: THREE.Mesh
  radius: number
  speed: number
  offset: number
  yBase: number
  yAmp: number
  tiltX: number
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroScene
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroScene () {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ─── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    // ─── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x04060c, 0.019)

    // ─── Camera ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      52,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    )
    camera.position.set(0, 0, 22)

    const clock = new THREE.Clock()

    // ─── Brand palette ───────────────────────────────────────────────────────
    const BLUE1 = new THREE.Color('#1E4FD8') // primary
    const BLUE2 = new THREE.Color('#2A5FE8') // bright
    const BLUE3 = new THREE.Color('#3D6FFF') // mid
    const BLUE4 = new THREE.Color('#5C8AFF') // glow
    const BLUE5 = new THREE.Color('#8FB0FF') // haze
    const DARK = new THREE.Color('#0A0F1E')

    // ─── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a1535, 2.5))

    const keyLight = new THREE.PointLight(0x1e4fd8, 150, 50)
    keyLight.position.set(7, 9, 12)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0x2a5fe8, 90, 36)
    rimLight.position.set(-9, -5, 6)
    scene.add(rimLight)

    const topLight = new THREE.PointLight(0xc8d8ff, 50, 28)
    topLight.position.set(0, 14, 5)
    scene.add(topLight)

    // Two animated orbiting fill lights
    const orbitA = new THREE.PointLight(0x3d6fff, 70, 22)
    const orbitB = new THREE.PointLight(0x5c8aff, 50, 18)
    scene.add(orbitA, orbitB)

    // ─── Shield ──────────────────────────────────────────────────────────────
    //  Heraldic profile — matches the logo silhouette
    const shieldShape = new THREE.Shape()
    shieldShape.moveTo(0, 5.4)
    shieldShape.bezierCurveTo(0.9, 5.7, 4.0, 5.1, 4.9, 3.3)
    shieldShape.bezierCurveTo(5.1, 2.1, 5.1, 0.6, 5.1, -1.0)
    shieldShape.bezierCurveTo(5.1, -2.6, 4.0, -4.4, 2.9, -5.6)
    shieldShape.bezierCurveTo(2.1, -6.5, 1.0, -7.2, 0.0, -8.0)
    shieldShape.bezierCurveTo(-1.0, -7.2, -2.1, -6.5, -2.9, -5.6)
    shieldShape.bezierCurveTo(-4.0, -4.4, -5.1, -2.6, -5.1, -1.0)
    shieldShape.bezierCurveTo(-5.1, 0.6, -5.1, 2.1, -4.9, 3.3)
    shieldShape.bezierCurveTo(-4.0, 5.1, -0.9, 5.7, 0.0, 5.4)

    const shieldExtrudeGeo = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.85,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.22,
      bevelSegments: 10
    })
    shieldExtrudeGeo.center()

    // ── Custom GLSL shader — metallic blue surface with fresnel + scan ──────
    const shieldMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBase: { value: DARK },
        uAccent: { value: BLUE1 },
        uGlow: { value: BLUE4 },
        uCamPos: { value: camera.position }
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vNormal   = normalize(normalMatrix * normal);
          vUv       = uv;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;

        uniform float uTime;
        uniform vec3  uBase;
        uniform vec3  uAccent;
        uniform vec3  uGlow;
        uniform vec3  uCamPos;

        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        // Fake environment map via view-space normal
        vec3 envSample(vec3 N, vec3 V) {
          vec3 R = reflect(-V, N);
          float t = 0.5 + 0.5 * R.y;
          return mix(uBase * 0.5, uAccent * 0.4, t);
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(uCamPos - vWorldPos);

          // Fresnel rim — brand blue edge glow
          float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);

          // Primary directional light (key + rim baked in)
          vec3 L1 = normalize(vec3( 0.55,  0.75, 0.65));
          vec3 L2 = normalize(vec3(-0.70, -0.35, 0.45));
          float d1 = max(dot(N, L1), 0.0);
          float d2 = max(dot(N, L2), 0.0) * 0.4;

          // Surface base
          vec3 col = mix(uBase * 0.7, uAccent * 0.55, d1 + d2 * 0.5);

          // Fake reflection
          col += envSample(N, V) * 0.35;

          // Horizontal scan sweep (3D printer layer pass effect)
          float worldY  = vWorldPos.y;
          float sweep   = sin(worldY * 1.4 - uTime * 2.0);
          float scanLine = smoothstep(0.90, 1.0, sweep) * 0.3;
          col += uAccent * scanLine;

          // Fine panel seam lines
          float panelH = smoothstep(0.97, 1.0, abs(sin(worldY * 4.8 + 0.5)));
          float panelV = smoothstep(0.97, 1.0, abs(sin(vWorldPos.x * 4.8 + 0.5)));
          col += uAccent * (panelH + panelV) * 0.07;

          // Specular highlight
          vec3 H    = normalize(L1 + V);
          float sp  = pow(max(dot(N, H), 0.0), 64.0) * 0.7;
          col += uGlow * sp;

          // Fresnel glow
          col += uGlow * rim * 1.1;

          // Subtle depth vignette on faces away from camera
          float facing = max(dot(N, V), 0.0);
          col *= 0.85 + facing * 0.15;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    })

    const shieldMesh = new THREE.Mesh(shieldExtrudeGeo, shieldMat)
    const shieldGroup = new THREE.Group()
    shieldGroup.add(shieldMesh)

    // Edge wireframe — subtle structural lines
    const edgeGeo = new THREE.EdgesGeometry(shieldExtrudeGeo, 18)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x2a5fe8,
      transparent: true,
      opacity: 0.14
    })
    shieldGroup.add(new THREE.LineSegments(edgeGeo, edgeMat))

    // Inner arrow plane — a flat simplified arrow on the shield face
    // representing the logo's central arrow graphic
    const arrowShape = new THREE.Shape()
    arrowShape.moveTo(0.0, 3.0) // top tip
    arrowShape.lineTo(2.6, 0.2) // right wing
    arrowShape.lineTo(1.2, 0.2) // right notch
    arrowShape.lineTo(1.2, -3.2) // right base
    arrowShape.lineTo(-1.2, -3.2) // left base
    arrowShape.lineTo(-1.2, 0.2) // left notch
    arrowShape.lineTo(-2.6, 0.2) // left wing
    arrowShape.closePath()

    const arrowGeo = new THREE.ShapeGeometry(arrowShape)
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0x1e4fd8,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide
    })
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat)
    arrowMesh.position.z = 0.5 // sit just above the shield face
    shieldGroup.add(arrowMesh)

    // Layer lines across shield face — representing 3D print layers
    const layerLinesGroup = new THREE.Group()
    for (let i = -6; i <= 5; i++) {
      const lGeo = new THREE.PlaneGeometry(8.5, 0.022)
      const lMat = new THREE.MeshBasicMaterial({
        color: 0x3d6fff,
        transparent: true,
        opacity: 0.07 + (i % 2 === 0 ? 0.03 : 0)
      })
      const l = new THREE.Mesh(lGeo, lMat)
      l.position.set(0, i * 0.32, 0.52)
      layerLinesGroup.add(l)
    }
    shieldGroup.add(layerLinesGroup)

    scene.add(shieldGroup)

    // ─── Ghost shield rings (larger, behind) ─────────────────────────────────
    const ghostShields: THREE.LineSegments[] = []
    ;[1.45, 1.8, 2.2].forEach((scale, idx) => {
      const ghostEdge = new THREE.EdgesGeometry(shieldExtrudeGeo, 18)
      const ghostMat = new THREE.LineBasicMaterial({
        color: [0x1e4fd8, 0x2a5fe8, 0x3d6fff][idx],
        transparent: true,
        opacity: [0.11, 0.07, 0.04][idx]
      })
      const ghost = new THREE.LineSegments(ghostEdge, ghostMat)
      ghost.scale.setScalar(scale)
      ghost.position.z = -(idx + 1) * 1.8
      ghostShields.push(ghost)
      scene.add(ghost)
    })

    // ─── Energy rings ────────────────────────────────────────────────────────
    const ringGroup = new THREE.Group()
    const ringMeshes: THREE.Mesh[] = []

    const ringDefs = [
      {
        r: 7.8,
        tube: 0.028,
        color: 0x1e4fd8,
        op: 0.55,
        rx: Math.PI / 2,
        ry: 0,
        rz: 0
      },
      {
        r: 9.0,
        tube: 0.018,
        color: 0x2a5fe8,
        op: 0.35,
        rx: Math.PI / 2,
        ry: 0.28,
        rz: 0.12
      },
      {
        r: 10.5,
        tube: 0.012,
        color: 0x3d6fff,
        op: 0.22,
        rx: Math.PI / 2,
        ry: -0.18,
        rz: 0.22
      },
      {
        r: 12.0,
        tube: 0.008,
        color: 0x5c8aff,
        op: 0.12,
        rx: Math.PI / 2,
        ry: 0.08,
        rz: -0.08
      }
    ]

    ringDefs.forEach(def => {
      const geo = new THREE.TorusGeometry(def.r, def.tube, 6, 140)
      const mat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: def.op
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.set(def.rx, def.ry, def.rz)
      ringGroup.add(mesh)
      ringMeshes.push(mesh)
    })
    scene.add(ringGroup)

    // ─── Floating debris ─────────────────────────────────────────────────────
    // Small printed-part fragments orbiting the shield
    const debrisGroup = new THREE.Group()
    const debrisItems: DebrisItem[] = []

    const debrisDefs: {
      geo: THREE.BufferGeometry
      radius: number
      speed: number
      offset: number
      yBase: number
      yAmp: number
      tiltX: number
    }[] = [
      {
        geo: new THREE.OctahedronGeometry(0.24, 0),
        radius: 7.4,
        speed: 0.18,
        offset: 0.0,
        yBase: 2.0,
        yAmp: 0.6,
        tiltX: 0.3
      },
      {
        geo: new THREE.BoxGeometry(0.3, 0.1, 0.3),
        radius: 6.8,
        speed: 0.13,
        offset: 1.1,
        yBase: -2.2,
        yAmp: 0.5,
        tiltX: 0.5
      },
      {
        geo: new THREE.OctahedronGeometry(0.18, 1),
        radius: 8.2,
        speed: 0.22,
        offset: 2.2,
        yBase: 3.0,
        yAmp: 0.8,
        tiltX: 0.2
      },
      {
        geo: new THREE.BoxGeometry(0.22, 0.08, 0.22),
        radius: 8.0,
        speed: 0.16,
        offset: 3.3,
        yBase: -3.2,
        yAmp: 0.4,
        tiltX: 0.7
      },
      {
        geo: new THREE.OctahedronGeometry(0.2, 0),
        radius: 7.0,
        speed: 0.28,
        offset: 4.4,
        yBase: 0.8,
        yAmp: 0.7,
        tiltX: 0.1
      },
      {
        geo: new THREE.CylinderGeometry(0.13, 0.13, 0.2, 8),
        radius: 7.6,
        speed: 0.12,
        offset: 5.5,
        yBase: -1.5,
        yAmp: 0.5,
        tiltX: 0.4
      },
      {
        geo: new THREE.OctahedronGeometry(0.15, 0),
        radius: 8.6,
        speed: 0.2,
        offset: 0.8,
        yBase: 3.8,
        yAmp: 0.6,
        tiltX: 0.6
      },
      {
        geo: new THREE.BoxGeometry(0.18, 0.06, 0.24),
        radius: 7.2,
        speed: 0.24,
        offset: 2.8,
        yBase: -3.5,
        yAmp: 0.5,
        tiltX: 0.35
      },
      {
        geo: new THREE.OctahedronGeometry(0.12, 0),
        radius: 9.0,
        speed: 0.17,
        offset: 1.6,
        yBase: 1.5,
        yAmp: 0.9,
        tiltX: 0.8
      },
      {
        geo: new THREE.CylinderGeometry(0.1, 0.1, 0.14, 6),
        radius: 6.6,
        speed: 0.26,
        offset: 3.9,
        yBase: -0.8,
        yAmp: 0.4,
        tiltX: 0.2
      }
    ]

    debrisDefs.forEach(def => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a3a9e,
        metalness: 0.85,
        roughness: 0.18,
        emissive: 0x0a1840,
        emissiveIntensity: 0.6
      })
      const mesh = new THREE.Mesh(def.geo, mat)
      debrisGroup.add(mesh)
      debrisItems.push({
        mesh,
        radius: def.radius,
        speed: def.speed,
        offset: def.offset,
        yBase: def.yBase,
        yAmp: def.yAmp,
        tiltX: def.tiltX
      })
    })
    scene.add(debrisGroup)

    // ─── Particle layers ─────────────────────────────────────────────────────
    // Shared custom shader — round glowing dots, additive blending
    const particleVert = /* glsl */ `
      attribute float size;
      attribute vec3  color;
      uniform   float uTime;
      uniform   float uPR;
      varying   vec3  vColor;
      varying   float vAlpha;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Organic three-axis drift
        pos.y += sin(uTime * 0.22 + pos.x * 0.09 + pos.z * 0.07) * 0.45;
        pos.x += cos(uTime * 0.17 + pos.y * 0.08) * 0.30;
        pos.z += sin(uTime * 0.14 + pos.x * 0.06) * 0.20;

        vec4 mvPos    = modelViewMatrix * vec4(pos, 1.0);
        gl_Position   = projectionMatrix * mvPos;
        gl_PointSize  = size * uPR * (52.0 / -mvPos.z);

        // Depth fade
        float depth = clamp((-mvPos.z - 4.0) / 38.0, 0.0, 1.0);
        vAlpha = (1.0 - depth * 0.7) * 0.9;
      }
    `

    const particleFrag = /* glsl */ `
      varying vec3  vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        // Soft gaussian-ish falloff
        float alpha = exp(-d * 5.0) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `

    const buildParticleLayer = (
      count: number,
      rMin: number,
      rMax: number,
      szMin: number,
      szMax: number,
      palette: THREE.Color[]
    ) => {
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const sz = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = rMin + Math.random() * (rMax - rMin)
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.58 // flatten Y → ellipsoid
        pos[i * 3 + 2] = r * Math.cos(phi)
        const c = palette[Math.floor(Math.random() * palette.length)]
        col[i * 3] = c.r
        col[i * 3 + 1] = c.g
        col[i * 3 + 2] = c.b
        sz[i] = szMin + Math.random() * (szMax - szMin)
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sz, 1))

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPR: { value: renderer.getPixelRatio() }
        },
        vertexShader: particleVert,
        fragmentShader: particleFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      })

      return { pts: new THREE.Points(geo, mat), mat, geo }
    }

    // Layer A — distant background field (dim, tiny)
    const layerA = buildParticleLayer(2800, 16, 45, 0.25, 0.85, [
      BLUE1,
      BLUE2,
      DARK
    ])
    // Layer B — mid-distance (medium blue)
    const layerB = buildParticleLayer(1000, 9, 22, 0.8, 2.2, [
      BLUE2,
      BLUE3,
      BLUE4
    ])
    // Layer C — foreground glows (bright, large)
    const layerC = buildParticleLayer(200, 5, 15, 2.2, 5.0, [
      BLUE3,
      BLUE4,
      BLUE5
    ])

    scene.add(layerA.pts, layerB.pts, layerC.pts)

    // ─── Filament strands ────────────────────────────────────────────────────
    // CatmullRom tubes — look like heated filament paths
    const filamentGroup = new THREE.Group()
    const filamentColors = [
      0x1e4fd8, 0x2a5fe8, 0x3d6fff, 0x5c8aff, 0x8fb0ff, 0x2a5fe8
    ]

    for (let i = 0; i < 6; i++) {
      const angleBase = (i / 6) * Math.PI * 2
      const pts: THREE.Vector3[] = []
      const ptCount = 7

      for (let j = 0; j < ptCount; j++) {
        const a = angleBase + (j / ptCount) * Math.PI * 0.9
        const r = 7.5 + Math.sin(j * 1.4 + i * 0.7) * 2.5
        pts.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            -4 + j * 1.5 + Math.sin(j * 0.9 + i) * 1.0,
            Math.sin(a) * r * 0.45 - 2
          )
        )
      }

      const curve = new THREE.CatmullRomCurve3(pts)
      const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.016, 4, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color: filamentColors[i],
        transparent: true,
        opacity: 0.28 + (i % 2) * 0.08
      })
      filamentGroup.add(new THREE.Mesh(tubeGeo, tubeMat))
    }
    scene.add(filamentGroup)

    // ─── Build platform grid ──────────────────────────────────────────────────
    const grid = new THREE.GridHelper(28, 18, 0x152040, 0x0c1528)
    grid.position.y = -10.5
    const gridMats = Array.isArray(grid.material)
      ? grid.material
      : [grid.material]
    gridMats.forEach(m => {
      ;(m as THREE.LineBasicMaterial).transparent = true
      ;(m as THREE.LineBasicMaterial).opacity = 0.55
    })
    scene.add(grid)

    // ─── Mouse parallax ───────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const lerped = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ─── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ─── Animation loop ───────────────────────────────────────────────────────
    let rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth mouse lerp
      lerped.x += (mouse.x - lerped.x) * 0.032
      lerped.y += (mouse.y - lerped.y) * 0.032

      // ── Shield ──────────────────────────────────────────────────────────────
      shieldMat.uniforms.uTime.value = t
      // Gentle breathing hover
      shieldGroup.position.y = Math.sin(t * 0.38) * 0.22
      // Slow auto-rotate + mouse parallax
      shieldGroup.rotation.y = Math.sin(t * 0.1) * 0.14 + lerped.x * 0.18
      shieldGroup.rotation.x = Math.cos(t * 0.07) * 0.06 + lerped.y * 0.1
      shieldGroup.rotation.z = Math.sin(t * 0.05) * 0.02

      // Ghost shield rings drift slightly behind
      ghostShields.forEach((g, i) => {
        g.rotation.y = shieldGroup.rotation.y * (0.6 - i * 0.1)
        g.rotation.x = shieldGroup.rotation.x * (0.5 - i * 0.1)
        const pulse = 1 + Math.sin(t * 0.4 + i * 1.2) * 0.015
        g.scale.setScalar((1.45 + i * 0.375) * pulse)
      })

      // ── Particles ───────────────────────────────────────────────────────────
      layerA.mat.uniforms.uTime.value = t
      layerB.mat.uniforms.uTime.value = t
      layerC.mat.uniforms.uTime.value = t

      layerA.pts.rotation.y = t * 0.009
      layerB.pts.rotation.y = t * 0.016 + lerped.x * 0.07
      layerB.pts.rotation.x = lerped.y * 0.04
      layerC.pts.rotation.y = t * 0.026 + lerped.x * 0.12
      layerC.pts.rotation.x = lerped.y * 0.07

      // ── Energy rings ────────────────────────────────────────────────────────
      ringMeshes[0].rotation.z = t * 0.055
      ringMeshes[1].rotation.z = -t * 0.038
      ringMeshes[2].rotation.z = t * 0.042
      ringMeshes[3].rotation.z = -t * 0.028
      ringGroup.rotation.y = lerped.x * 0.09
      ringGroup.rotation.x = lerped.y * 0.06

      // ── Debris orbit ────────────────────────────────────────────────────────
      debrisItems.forEach(d => {
        const a = t * d.speed + d.offset
        d.mesh.position.set(
          Math.cos(a) * d.radius,
          d.yBase + Math.sin(t * 0.38 + d.offset) * d.yAmp,
          Math.sin(a) * d.radius * (0.4 + d.tiltX * 0.2)
        )
        d.mesh.rotation.x = t * d.speed * 1.4
        d.mesh.rotation.y = t * d.speed * 0.9
        d.mesh.rotation.z = t * d.speed * 0.5
      })

      // ── Orbiting fill lights ─────────────────────────────────────────────────
      orbitA.position.set(
        Math.cos(t * 0.28) * 11,
        Math.sin(t * 0.19) * 6,
        Math.sin(t * 0.28) * 9
      )
      orbitB.position.set(
        Math.sin(t * 0.23 + Math.PI) * 10,
        Math.cos(t * 0.16) * 5,
        Math.cos(t * 0.23 + Math.PI) * 8
      )

      // ── Filaments slow drift ─────────────────────────────────────────────────
      filamentGroup.rotation.y = t * 0.038
      filamentGroup.rotation.x = Math.sin(t * 0.08) * 0.04

      // ── Grid breathe ────────────────────────────────────────────────────────
      gridMats.forEach(m => {
        ;(m as THREE.LineBasicMaterial).opacity =
          0.4 + Math.sin(t * 0.55) * 0.14
      })

      renderer.render(scene, camera)
    }

    animate()

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)

      // Geometries
      ;[
        shieldExtrudeGeo,
        edgeGeo,
        arrowGeo,
        layerA.geo,
        layerB.geo,
        layerC.geo
      ].forEach(g => g.dispose())
      debrisItems.forEach(d => d.mesh.geometry.dispose())

      // Materials
      ;[
        shieldMat,
        edgeMat,
        arrowMat,
        layerA.mat,
        layerB.mat,
        layerC.mat
      ].forEach(m => m.dispose())
      debrisItems.forEach(d => (d.mesh.material as THREE.Material).dispose())

      // Filament tubes
      filamentGroup.children.forEach(c => {
        const m = c as THREE.Mesh
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })

      // Ghost shields
      ghostShields.forEach(g => {
        g.geometry.dispose()
        ;(g.material as THREE.Material).dispose()
      })

      // Layer lines
      layerLinesGroup.children.forEach(c => {
        const m = c as THREE.Mesh
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })

      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className='absolute inset-0 w-full h-full'
      aria-hidden='true'
    />
  )
}
