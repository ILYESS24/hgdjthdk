"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    THREE: any
  }
}

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: any
    scene: any
    renderer: any
    uniforms: any
    animationId: number | null
  }>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    console.log("ShaderAnimation: Loading Three.js...")
    // Load Three.js dynamically
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js"
    script.onload = () => {
      console.log("ShaderAnimation: Three.js loaded successfully")
      if (containerRef.current && window.THREE) {
        console.log("ShaderAnimation: Initializing Three.js")
        initThreeJS()
      } else {
        console.error("ShaderAnimation: Container or Three.js not available")
      }
    }
    script.onerror = () => {
      console.error("ShaderAnimation: Failed to load Three.js")
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose()
      }
      document.head.removeChild(script)
    }
  }, [])

  const initThreeJS = () => {
    console.log("ShaderAnimation: initThreeJS called")
    if (!containerRef.current || !window.THREE) {
      console.error("ShaderAnimation: Missing container or Three.js")
      return
    }

    const THREE = window.THREE
    const container = containerRef.current
    console.log("ShaderAnimation: THREE object available:", !!THREE)

    // Clear any existing content
    container.innerHTML = ""

    // Initialize camera
    const camera = new THREE.Camera()
    camera.position.z = 1

    // Initialize scene
    const scene = new THREE.Scene()

    // Create geometry
    const geometry = new THREE.PlaneBufferGeometry(2, 2)

    // Define uniforms
    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader - Animated lines effect
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float random(in float x) {
        return fract(sin(x) * 1e4);
      }

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

        // Simplified mosaic effect
        vec2 mosaicScale = vec2(4.0, 2.0);
        vec2 screenSize = vec2(256.0, 256.0);

        uv.x = floor(uv.x * screenSize.x / mosaicScale.x) / (screenSize.x / mosaicScale.x);
        uv.y = floor(uv.y * screenSize.y / mosaicScale.y) / (screenSize.y / mosaicScale.y);

        float t = time * 0.06 + random(uv.x) * 0.4;
        float lineWidth = 0.008;

        vec3 color = vec3(0.0);

        // Simplified loop for better performance
        for(int j = 0; j < 3; j++) {
          for(int i = 0; i < 3; i++) {
            float phase = t - 0.01 * float(j) + float(i) * 0.01;
            float dist = abs(fract(phase) * 1.0 - length(uv));
            color[j] += lineWidth * float(i * i) / (dist + 0.001);
          }
        }

        // Normalize and enhance colors
        color = clamp(color * 0.1, 0.0, 1.0);

        gl_FragColor = vec4(color[0], color[1], color[2], 1.0);
      }
    `

    // Create material
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    // Create mesh and add to scene
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Store references
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: null,
    }

    // Handle resize
    const onWindowResize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    // Animation loop
    const animate = () => {
      sceneRef.current.animationId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05
      renderer.render(scene, camera)
    }

    animate()
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute" 
    />
  )
}
