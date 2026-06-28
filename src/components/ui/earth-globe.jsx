import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * EarthGlobe — a realistic, interactive 3D Earth.
 *
 * - Real NASA Blue Marble texture for the surface
 * - Separate cloud layer that drifts independently
 * - Soft atmosphere glow (Fresnel-style shader)
 * - Starfield background
 * - Auto-rotates, and can be dragged to spin manually
 *
 * Usage: <EarthGlobe />  (drop it anywhere, it fills its parent container)
 */
export default function EarthGlobe({ style = {}, isBackground = false }) {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // --- Scene / camera / renderer -----------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // --- Lighting -------------------------------------------------------
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x404a66, 1.1);
    scene.add(ambient);

    // --- Starfield --------------------------------------------------
    function makeStars() {
      const count = 1800;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 60 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.6,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
      });
      return new THREE.Points(geo, mat);
    }
    scene.add(makeStars());

    // --- Texture loading ---------------------------------------------
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    const TEX_BASE =
      "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/";

    let loadedCount = 0;
    const totalToLoad = 2;
    const onOneLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) setLoaded(true);
    };

    const earthMap = loader.load(TEX_BASE + "earth_atmos_2048.jpg", onOneLoaded, undefined, onOneLoaded);
    const cloudsMap = loader.load(
      TEX_BASE + "earth_clouds_1024.png",
      onOneLoaded,
      undefined,
      onOneLoaded
    );

    // --- Earth sphere ---------------------------------------------------
    const earthGeo = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      shininess: 8,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // --- Cloud layer (slightly larger, transparent) ---------------------
    const cloudGeo = new THREE.SphereGeometry(2.02, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    // --- Atmosphere glow (Fresnel rim shader) ---------------------------
    const glowGeo = new THREE.SphereGeometry(2.18, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x4ea8ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // --- Slight axial tilt for realism ---------------------------------
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = (23.4 * Math.PI) / 180;
    tiltGroup.add(earth);
    tiltGroup.add(clouds);
    tiltGroup.add(glow);
    scene.add(tiltGroup);

    // --- Interaction: drag to spin, auto-rotate when idle ---------------
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0.0016; // auto-rotate speed
    let velocityY = 0;
    let userVelocityX = 0;
    let userVelocityY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX ?? e.touches?.[0]?.clientX;
      prevY = e.clientY ?? e.touches?.[0]?.clientY;
    };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      const dx = x - prevX;
      const dy = y - prevY;
      userVelocityX = dx * 0.005;
      userVelocityY = dy * 0.005;
      tiltGroup.rotation.y += userVelocityX;
      earth.rotation.x += userVelocityY * 0;
      prevX = x;
      prevY = y;
    };
    const onPointerUp = () => {
      isDragging = false;
      velocityX = userVelocityX * 0.6;
      velocityY = userVelocityY * 0.6;
    };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.addEventListener("pointerdown", (e) => {
      dom.style.cursor = "grabbing";
      onPointerDown(e);
    });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", () => {
      dom.style.cursor = "grab";
      onPointerUp();
    });
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    dom.addEventListener("touchmove", onPointerMove, { passive: true });
    dom.addEventListener("touchend", onPointerUp);

    // --- Resize handling --------------------------------------------------
    const handleResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation loop -----------------------------------------------
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!isDragging) {
        // decay drag momentum back to gentle auto-rotate
        velocityX += (0.0016 - velocityX) * 0.02;
        tiltGroup.rotation.y += velocityX;
      }

      clouds.rotation.y += 0.00035; // clouds drift slightly faster than land

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeChild(renderer.domElement);
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: isBackground ? "absolute" : "relative",
        inset: isBackground ? 0 : "auto",
        width: "100%",
        height: "100%",
        minHeight: isBackground ? "auto" : "420px",
        background: "radial-gradient(ellipse at center, #0a0e1a 0%, #000000 100%)",
        borderRadius: isBackground ? "0px" : "16px",
        overflow: "hidden",
        ...style,
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7d8aa8",
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            letterSpacing: "0.04em",
            pointerEvents: "none",
          }}
        >
          loading earth…
        </div>
      )}
    </div>
  );
}
