import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// HeroScene — pure Three.js recreation of the logo geometry
// No image textures. All shapes are procedural ExtrudeGeometry.
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroScene () {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Collect every disposable so cleanup is always complete
    const geos: THREE.BufferGeometry[] = []
    const mats: THREE.Material[] = []
    const track = <T extends THREE.BufferGeometry>(g: T): T => {
      geos.push(g)
      return g
    }
    const mat = <T extends THREE.Material>(m: T): T => {
      mats.push(m)
      return m
    }

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
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    // ─── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x04060c, 0.015)
    const camera = new THREE.PerspectiveCamera(
      52,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    )
    camera.position.set(0, 0, 22)
    const clock = new THREE.Clock()

    // ─── Responsive ──────────────────────────────────────────────────────────
    const getScale = () => {
      const a = mount.clientWidth / mount.clientHeight
      if (a < 0.5) return 0.42
      if (a < 0.7) return 0.56
      if (a < 0.9) return 0.7
      if (a < 1.1) return 0.83
      if (a < 1.4) return 0.93
      return 1.0
    }

    // ─── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d1a40, 4.5))

    // Key: white-ish from upper right — makes top faces of the arrow bright
    const dirLight = new THREE.DirectionalLight(0xd0e0ff, 3.2)
    dirLight.position.set(5, 9, 7)
    scene.add(dirLight)

    // Blue fill from the left
    const blueKey = new THREE.PointLight(0x1e4fd8, 160, 48)
    blueKey.position.set(-7, 5, 10)
    scene.add(blueKey)

    // Rim from back-right
    const rimLight = new THREE.PointLight(0x4872ff, 90, 36)
    rimLight.position.set(8, -3, -5)
    scene.add(rimLight)

    // Two animated orbiting fills
    const orbitA = new THREE.PointLight(0x2a5fe8, 80, 24)
    const orbitB = new THREE.PointLight(0x5c8aff, 55, 20)
    scene.add(orbitA, orbitB)

    // ─── Shared materials ────────────────────────────────────────────────────
    const matBlue = mat(
      new THREE.MeshStandardMaterial({
        color: 0x1e4fd8,
        metalness: 0.7,
        roughness: 0.22,
        emissive: 0x0a1840,
        emissiveIntensity: 0.25
      })
    )
    const matBlueBright = mat(
      new THREE.MeshStandardMaterial({
        color: 0x3060f0,
        metalness: 0.8,
        roughness: 0.14,
        emissive: 0x1030b0,
        emissiveIntensity: 0.3
      })
    )
    const matDark = mat(
      new THREE.MeshStandardMaterial({
        color: 0x050a14,
        metalness: 0.25,
        roughness: 0.8
      })
    )
    const matBlack = mat(
      new THREE.MeshStandardMaterial({
        color: 0x02030a,
        metalness: 0.15,
        roughness: 0.9
      })
    )
    const matEdge = mat(
      new THREE.LineBasicMaterial({
        color: 0x4872ff,
        transparent: true,
        opacity: 0.18
      })
    )

    // ─── Helper: build the heraldic shield path ───────────────────────────────
    // s = uniform scale factor applied to all coordinates
    const makeShieldShape = (s: number): THREE.Shape => {
      const p = new THREE.Shape()
      p.moveTo(0, 5.4 * s)
      p.bezierCurveTo(0.9 * s, 5.7 * s, 4.0 * s, 5.1 * s, 4.9 * s, 3.3 * s)
      p.bezierCurveTo(5.1 * s, 2.1 * s, 5.1 * s, 0.6 * s, 5.1 * s, -1.0 * s)
      p.bezierCurveTo(5.1 * s, -2.6 * s, 4.0 * s, -4.4 * s, 2.9 * s, -5.6 * s)
      p.bezierCurveTo(2.1 * s, -6.5 * s, 1.0 * s, -7.2 * s, 0, -8.0 * s)
      p.bezierCurveTo(
        -1.0 * s,
        -7.2 * s,
        -2.1 * s,
        -6.5 * s,
        -2.9 * s,
        -5.6 * s
      )
      p.bezierCurveTo(
        -4.0 * s,
        -4.4 * s,
        -5.1 * s,
        -2.6 * s,
        -5.1 * s,
        -1.0 * s
      )
      p.bezierCurveTo(-5.1 * s, 0.6 * s, -5.1 * s, 2.1 * s, -4.9 * s, 3.3 * s)
      p.bezierCurveTo(-4.0 * s, 5.1 * s, -0.9 * s, 5.7 * s, 0, 5.4 * s)
      return p
    }

    // ─── LOGO GROUP ──────────────────────────────────────────────────────────
    const logoGroup = new THREE.Group()

    const EXTRUDE_BEVEL = {
      depth: 0.8,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.14,
      bevelSegments: 5
    }

    // ── A. Shield outer ring (blue) ──────────────────────────────────────────
    // We create the ring by layering the full outer shield (blue) behind a
    // slightly smaller dark inner shield. No holes needed — simpler & stable.
    const outerShieldGeo = track(
      new THREE.ExtrudeGeometry(makeShieldShape(1.0), EXTRUDE_BEVEL)
    )
    outerShieldGeo.center()

    const outerMesh = new THREE.Mesh(outerShieldGeo, matBlue)
    logoGroup.add(outerMesh)

    // Edge lines on the outer shield
    logoGroup.add(
      new THREE.LineSegments(
        track(new THREE.EdgesGeometry(outerShieldGeo, 18)),
        matEdge
      )
    )

    // ── B. Shield inner face (dark) — sits in front, creates the border ──────
    // Same geometry, scaled 0.82 in XY (creates ~0.9-unit border), thin in Z.
    // position.z = 0.65 clears the outer front face (which is at z = +0.40).
    const innerMesh = new THREE.Mesh(outerShieldGeo, matDark)
    innerMesh.scale.set(0.82, 0.82, 0.35)
    innerMesh.position.z = 0.65
    logoGroup.add(innerMesh)

    // ── C. Main arrow (upper shield interior) ────────────────────────────────
    // The logo's dominant element: a large right-pointing arrow.
    // Split into upper (bright blue) and lower (dark) halves to match the
    // two-tone shading in the logo graphic.

    // Upper half of arrow — bright face (lit by key light from upper-right)
    const arrowTopShape = new THREE.Shape()
    arrowTopShape.moveTo(-3.1, 0.05) // left centre-line
    arrowTopShape.lineTo(3.9, 0.05) // right tip
    arrowTopShape.lineTo(-3.1, 2.1) // upper-left body
    arrowTopShape.lineTo(-1.6, 0.05) // inner tail notch
    arrowTopShape.closePath()

    const arrowTopGeo = track(
      new THREE.ExtrudeGeometry(arrowTopShape, {
        depth: 0.38,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.05,
        bevelSegments: 3
      })
    )
    arrowTopGeo.center()
    const arrowTopMesh = new THREE.Mesh(arrowTopGeo, matBlueBright)

    // Lower half of arrow — shadow face (in shadow of key light)
    const arrowBotShape = new THREE.Shape()
    arrowBotShape.moveTo(-3.1, -0.05) // left centre-line
    arrowBotShape.lineTo(3.9, -0.05) // right tip
    arrowBotShape.lineTo(-3.1, -2.1) // lower-left body
    arrowBotShape.lineTo(-1.6, -0.05) // inner tail notch
    arrowBotShape.closePath()

    const arrowBotGeo = track(
      new THREE.ExtrudeGeometry(arrowBotShape, {
        depth: 0.38,
        bevelEnabled: false
      })
    )
    arrowBotGeo.center()
    const arrowBotMesh = new THREE.Mesh(arrowBotGeo, matBlack)

    const arrowGroup = new THREE.Group()
    arrowGroup.add(arrowTopMesh, arrowBotMesh)
    arrowGroup.position.set(0.35, 0.9, 1.1) // upper interior of shield
    arrowGroup.rotation.z = -0.06 // slight CCW tilt like the logo
    logoGroup.add(arrowGroup)

    // Dark diagonal shadow panel behind the arrow (gives the logo depth)
    const shadowShape = new THREE.Shape()
    shadowShape.moveTo(-2.8, 2.0)
    shadowShape.lineTo(-0.4, 2.0)
    shadowShape.lineTo(2.2, -0.5)
    shadowShape.lineTo(2.2, -1.4)
    shadowShape.lineTo(-1.5, -1.4)
    shadowShape.lineTo(-2.8, 0.5)
    shadowShape.closePath()
    const shadowGeo = track(
      new THREE.ExtrudeGeometry(shadowShape, {
        depth: 0.2,
        bevelEnabled: false
      })
    )
    shadowGeo.center()
    const shadowMesh = new THREE.Mesh(shadowGeo, matBlack)
    shadowMesh.position.set(-0.25, 0.65, 0.92)
    shadowMesh.rotation.z = -0.06
    logoGroup.add(shadowMesh)

    // Right-wing fragment (the small triangle that appears at top-right in logo)
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0.0, 0.0)
    wingShape.lineTo(2.2, 1.4)
    wingShape.lineTo(3.8, 0.0)
    wingShape.lineTo(2.2, -0.3)
    wingShape.closePath()
    const wingGeo = track(
      new THREE.ExtrudeGeometry(wingShape, { depth: 0.28, bevelEnabled: false })
    )
    wingGeo.center()
    const wingMesh = new THREE.Mesh(wingGeo, matBlueBright)
    wingMesh.position.set(0.5, 1.55, 1.08)
    logoGroup.add(wingMesh)

    // ── D. V-chevron (lower interior, below arrow) ───────────────────────────
    // In the logo this is the converging angular lines pointing downward.
    const vShape = new THREE.Shape()
    vShape.moveTo(-2.5, 0.2) // top-left
    vShape.lineTo(0.0, -2.1) // bottom apex
    vShape.lineTo(2.5, 0.2) // top-right
    vShape.lineTo(1.8, 0.2) // right notch
    vShape.lineTo(0.0, -1.3) // inner apex
    vShape.lineTo(-1.8, 0.2) // left notch
    vShape.closePath()

    const vGeo = track(
      new THREE.ExtrudeGeometry(vShape, {
        depth: 0.3,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.04,
        bevelSegments: 2
      })
    )
    vGeo.center()

    // Upper bright arm (catches the key light)
    const vTopShape = new THREE.Shape()
    vTopShape.moveTo(-2.5, 0.2)
    vTopShape.lineTo(0.0, -2.1)
    vTopShape.lineTo(-1.8, 0.2)
    vTopShape.lineTo(0.0, -1.3)
    vTopShape.closePath()
    const vTopGeo = track(
      new THREE.ExtrudeGeometry(vTopShape, { depth: 0.3, bevelEnabled: false })
    )
    vTopGeo.center()
    const vTopMesh = new THREE.Mesh(vTopGeo, matBlue)

    const vBotShape = new THREE.Shape()
    vBotShape.moveTo(0.0, -2.1)
    vBotShape.lineTo(2.5, 0.2)
    vBotShape.lineTo(1.8, 0.2)
    vBotShape.lineTo(0.0, -1.3)
    vBotShape.closePath()
    const vBotGeo = track(
      new THREE.ExtrudeGeometry(vBotShape, { depth: 0.3, bevelEnabled: false })
    )
    vBotGeo.center()
    const vBotMesh = new THREE.Mesh(vBotGeo, matBlack)

    const vGroup = new THREE.Group()
    vGroup.add(vTopMesh, vBotMesh)
    vGroup.position.set(0.0, -2.35, 1.1)
    logoGroup.add(vGroup)

    // ── E. Horizontal layer-stripes (bottom sides, 3 per side) ──────────────
    // These match the parallel lines visible in the lower corners of the logo.
    const STRIPE = { w: 1.1, h: 0.1, d: 0.12 }
    ;[-1, 1].forEach(side => {
      for (let i = 0; i < 3; i++) {
        const sGeo = track(new THREE.BoxGeometry(STRIPE.w, STRIPE.h, STRIPE.d))
        const sMesh = new THREE.Mesh(sGeo, i === 0 ? matBlue : matDark)
        sMesh.position.set(side * 2.65, -4.05 + i * 0.3, 1.1)
        sMesh.rotation.z = side * 0.13
        logoGroup.add(sMesh)
      }
    })

    logoGroup.scale.setScalar(getScale())
    scene.add(logoGroup)

    // ─── Ghost shield outlines (receding in depth, behind logo) ──────────────
    const ghostShields: THREE.LineSegments[] = []
    ;[1.44, 1.8, 2.2].forEach((sc, i) => {
      const gMat = mat(
        new THREE.LineBasicMaterial({
          color: [0x1e4fd8, 0x2a5fe8, 0x3d6fff][i],
          transparent: true,
          opacity: [0.1, 0.06, 0.028][i]
        })
      )
      const g = new THREE.LineSegments(
        track(new THREE.EdgesGeometry(outerShieldGeo, 18)),
        gMat
      )
      g.scale.setScalar(sc)
      g.position.z = -(i + 1) * 2.0
      ghostShields.push(g)
      scene.add(g)
    })

    // ─── Energy rings ────────────────────────────────────────────────────────
    const ringGroup = new THREE.Group()
    const ringMeshes: THREE.Mesh[] = []
    ;[
      { r: 8.0, tube: 0.026, color: 0x1e4fd8, op: 0.52, ry: 0.0 },
      { r: 9.5, tube: 0.016, color: 0x2a5fe8, op: 0.32, ry: 0.28 },
      { r: 11.2, tube: 0.01, color: 0x3d6fff, op: 0.18, ry: -0.18 }
    ].forEach(d => {
      const m = new THREE.Mesh(
        track(new THREE.TorusGeometry(d.r, d.tube, 6, 128)),
        mat(
          new THREE.MeshBasicMaterial({
            color: d.color,
            transparent: true,
            opacity: d.op
          })
        )
      )
      m.rotation.set(Math.PI / 2, d.ry, 0)
      ringGroup.add(m)
      ringMeshes.push(m)
    })
    scene.add(ringGroup)

    // ─── Particle layers (2 layers, stable custom shader) ────────────────────
    // Using 'precision mediump float' and explicit attribute declarations to
    // avoid crashes on mobile WebGL / stricter GLSL compilers.
    const pVert = /* glsl */ `
      precision mediump float;
      attribute float size;
      attribute vec3  color;
      uniform   float uTime;
      uniform   float uPR;
      varying   vec3  vColor;
      varying   float vAlpha;

      void main() {
        vColor  = color;
        vec3 p  = position;
        p.y    += sin(uTime * 0.22 + p.x * 0.09 + p.z * 0.07) * 0.42;
        p.x    += cos(uTime * 0.17 + p.y * 0.08) * 0.26;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position  = projectionMatrix * mv;
        gl_PointSize = size * uPR * (50.0 / -mv.z);
        float depth  = clamp((-mv.z - 4.0) / 40.0, 0.0, 1.0);
        vAlpha = (1.0 - depth * 0.70) * 0.88;
      }
    `
    const pFrag = /* glsl */ `
      precision mediump float;
      varying vec3  vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, exp(-d * 4.8) * vAlpha);
      }
    `

    const C = {
      b1: new THREE.Color('#1E4FD8'),
      b2: new THREE.Color('#2A5FE8'),
      b3: new THREE.Color('#3D6FFF'),
      b4: new THREE.Color('#5C8AFF'),
      b5: new THREE.Color('#8FB0FF'),
      dk: new THREE.Color('#0A0F1E')
    }

    const buildLayer = (
      count: number,
      rMin: number,
      rMax: number,
      szMin: number,
      szMax: number,
      pal: THREE.Color[]
    ) => {
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const sz = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        const θ = Math.random() * Math.PI * 2
        const φ = Math.acos(2 * Math.random() - 1)
        const r = rMin + Math.random() * (rMax - rMin)
        pos[i * 3] = r * Math.sin(φ) * Math.cos(θ)
        pos[i * 3 + 1] = r * Math.sin(φ) * Math.sin(θ) * 0.58
        pos[i * 3 + 2] = r * Math.cos(φ)
        const c = pal[Math.floor(Math.random() * pal.length)]
        col[i * 3] = c.r
        col[i * 3 + 1] = c.g
        col[i * 3 + 2] = c.b
        sz[i] = szMin + Math.random() * (szMax - szMin)
      }
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sz, 1))
      const m = mat(
        new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uPR: { value: renderer.getPixelRatio() }
          },
          vertexShader: pVert,
          fragmentShader: pFrag,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true
        })
      )
      return { pts: new THREE.Points(geo, m), m }
    }

    // Layer A — wide dim background field
    const layerA = buildLayer(2200, 14, 44, 0.28, 0.9, [C.b1, C.b2, C.dk])
    // Layer B — brighter mid-range glows
    const layerB = buildLayer(520, 6, 20, 1.2, 4.0, [C.b3, C.b4, C.b5])
    scene.add(layerA.pts, layerB.pts)

    // ─── Build-platform grid ──────────────────────────────────────────────────
    const grid = new THREE.GridHelper(26, 16, 0x152040, 0x0c1528)
    grid.position.y = -11.5
    const gridMats = Array.isArray(grid.material)
      ? grid.material
      : [grid.material]
    gridMats.forEach(m => {
      ;(m as THREE.LineBasicMaterial).transparent = true
      ;(m as THREE.LineBasicMaterial).opacity = 0.45
    })
    scene.add(grid)

    // ─── Mouse / touch parallax ───────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const lerped = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return
      mouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // ─── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      logoGroup.scale.setScalar(getScale())
    }
    window.addEventListener('resize', onResize)

    // ─── Animation loop ───────────────────────────────────────────────────────
    let rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth mouse lerp (separate x/y for independent feel)
      lerped.x += (mouse.x - lerped.x) * 0.032
      lerped.y += (mouse.y - lerped.y) * 0.032

      // ── Logo group — breathing hover + parallax ──────────────────────────
      logoGroup.position.y = Math.sin(t * 0.38) * 0.24
      logoGroup.rotation.y = Math.sin(t * 0.09) * 0.13 + lerped.x * 0.18
      logoGroup.rotation.x = Math.cos(t * 0.07) * 0.05 + lerped.y * 0.1
      logoGroup.rotation.z = Math.sin(t * 0.05) * 0.016

      // ── Ghost shields lag behind with reduced amplitude ──────────────────
      ghostShields.forEach((g, i) => {
        g.rotation.y = logoGroup.rotation.y * (0.55 - i * 0.1)
        g.rotation.x = logoGroup.rotation.x * (0.45 - i * 0.1)
        g.scale.setScalar(
          (1.44 + i * 0.38) * (1 + Math.sin(t * 0.4 + i * 1.2) * 0.012)
        )
      })

      // ── Particles ────────────────────────────────────────────────────────
      layerA.m.uniforms.uTime.value = t
      layerB.m.uniforms.uTime.value = t
      layerA.pts.rotation.y = t * 0.01
      layerB.pts.rotation.y = t * 0.024 + lerped.x * 0.09
      layerB.pts.rotation.x = lerped.y * 0.06

      // ── Rings ────────────────────────────────────────────────────────────
      ringMeshes[0].rotation.z = t * 0.052
      ringMeshes[1].rotation.z = -t * 0.036
      ringMeshes[2].rotation.z = t * 0.041
      ringGroup.rotation.y = lerped.x * 0.08
      ringGroup.rotation.x = lerped.y * 0.05

      // ── Orbiting fill lights ─────────────────────────────────────────────
      orbitA.position.set(
        Math.cos(t * 0.28) * 10,
        Math.sin(t * 0.19) * 5,
        Math.sin(t * 0.28) * 8
      )
      orbitB.position.set(
        Math.sin(t * 0.23 + Math.PI) * 9,
        Math.cos(t * 0.16) * 4,
        Math.cos(t * 0.23 + Math.PI) * 7
      )

      // ── Grid breathe ─────────────────────────────────────────────────────
      gridMats.forEach(m => {
        ;(m as THREE.LineBasicMaterial).opacity =
          0.34 + Math.sin(t * 0.55) * 0.13
      })

      renderer.render(scene, camera)
    }
    animate()

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      geos.forEach(g => g.dispose())
      mats.forEach(m => m.dispose())
      renderer.dispose()
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement)
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
