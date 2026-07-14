import { useEffect, useRef } from 'react';

const pointCloudUrl = '/hanxiu-magnolia-points.bin';
const maxParticles = 12000;
const particleCycleDuration = 7.2 / 1.2;
type ThreeModule = typeof import('three');

type ParticleState = {
  basePositions: Float32Array;
  positions: Float32Array;
  colors: Float32Array;
  velocity: Float32Array;
  life: Float32Array;
  ttl: Float32Array;
};

function parsePointCloud(THREE: ThreeModule, buffer: ArrayBuffer) {
  if (buffer.byteLength < 4) throw new Error('Invalid particle model.');
  const view = new DataView(buffer);
  const count = view.getUint32(0, true);
  if (count === 0 || count > maxParticles || buffer.byteLength !== 4 + count * 12) {
    throw new Error('Invalid particle model size.');
  }

  const points: import('three').Vector3[] = new Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = 4 + index * 12;
    points[index] = new THREE.Vector3(
      view.getFloat32(offset, true),
      view.getFloat32(offset + 4, true),
      view.getFloat32(offset + 8, true),
    );
  }
  return points;
}

function buildParticleState(THREE: ThreeModule, points: import('three').Vector3[]) {
  const count = Math.min(points.length, maxParticles);
  const basePositions = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const ttl = new Float32Array(count);
  const color = new THREE.Color();
  const fallbackGradient = [new THREE.Color('#6d28d9'), new THREE.Color('#c026d3'), new THREE.Color('#fb7185')];
  const minY = Math.min(...points.slice(0, count).map((point) => point.y));
  const maxY = Math.max(...points.slice(0, count).map((point) => point.y));

  for (let index = 0; index < count; index += 1) {
    const point = points[index];
    const offset = index * 3;
    const t = (point.y - minY) / Math.max(0.0001, maxY - minY);

    basePositions[offset] = point.x;
    basePositions[offset + 1] = point.y;
    basePositions[offset + 2] = point.z;
    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = point.z;

    color.copy(fallbackGradient[0]).lerp(fallbackGradient[1], Math.min(1, t * 1.15));
    if (t > 0.65) {
      color.lerp(fallbackGradient[2], (t - 0.65) / 0.35);
    }
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;

    const length = Math.max(0.001, Math.hypot(point.x, point.y, point.z));
    const force = 0.8 + Math.random() * 0.85;
    velocity[offset] = (point.x / length) * force + (Math.random() - 0.5) * 0.35;
    velocity[offset + 1] = (point.y / length) * force + (Math.random() - 0.5) * 0.35;
    velocity[offset + 2] = (point.z / length) * force + (Math.random() - 0.5) * 0.28;
    life[index] = Math.random() * Math.PI * 2;
    ttl[index] = 1.8 + Math.random() * 1.6;
  }

  return { basePositions, positions, colors, velocity, life, ttl };
}

export function InteractiveBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const pointCloudRequest = fetch(pointCloudUrl, { cache: 'force-cache' });
      const THREE = await import('three');
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 10.4);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.className = 'hanxiu-three-canvas';
      mount.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight('#ffffff', 1.2);
      const accent = new THREE.PointLight('#ff4fd8', 2.8, 30);
      accent.position.set(7, 4, 10);
      const rim = new THREE.PointLight('#7c3aed', 1.8, 26);
      rim.position.set(-3, -4, 8);
      scene.add(ambient, accent, rim);

      const particleAnchor = new THREE.Group();
      particleAnchor.position.set(1.9, 0.15, 0);
      scene.add(particleAnchor);

      const targetParallax = new THREE.Vector2();
      const currentParallax = new THREE.Vector2();
      let pointsMesh: import('three').Points<import('three').BufferGeometry, import('three').PointsMaterial> | null = null;
      let edgeMesh: import('three').Points<import('three').BufferGeometry, import('three').PointsMaterial> | null = null;
      let particleState: ParticleState | null = null;
      let burstStrength = 0;

      const geometry = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial({
        size: 0.086,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });
      const edgeMaterial = new THREE.PointsMaterial({
        size: 0.118,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: '#ef8fd0',
      });
      const applySampledPoints = (sampled: import('three').Vector3[]) => {
        particleState = buildParticleState(THREE, sampled);
        geometry.setAttribute('position', new THREE.BufferAttribute(particleState.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(particleState.colors, 3));
        geometry.computeBoundingSphere();

        if (!pointsMesh) {
          pointsMesh = new THREE.Points(geometry, material);
          pointsMesh.rotation.set(-0.18, 0.1, THREE.MathUtils.degToRad(-65));
          edgeMesh = new THREE.Points(geometry, edgeMaterial);
          edgeMesh.rotation.copy(pointsMesh.rotation);
          edgeMesh.scale.set(1.16, 1.012, 1.012);
          particleAnchor.add(pointsMesh);
          particleAnchor.add(edgeMesh);
        }
      };

      try {
        const response = await pointCloudRequest;
        if (!response.ok) throw new Error(`Particle model request failed: ${response.status}`);
        const sampled = parsePointCloud(THREE, await response.arrayBuffer());
        if (disposed) return;
        applySampledPoints(sampled);
        renderer.domElement.classList.add('is-ready');
      } catch {
        // 加载失败时保留静态首屏背景，不展示错误的临时线构模型。
      }

      const clock = new THREE.Clock();
      let elapsedTime = 0;

      const handlePointerMove = (event: MouseEvent) => {
        targetParallax.x = (event.clientX / window.innerWidth - 0.5) * 1.8;
        targetParallax.y = (event.clientY / window.innerHeight - 0.5) * 1.2;
      };

      const handleClick = () => {
        burstStrength = 1.4;
      };

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        particleAnchor.position.x = window.innerWidth < 900 ? 0.2 : 8.15;
        particleAnchor.position.y = window.innerWidth < 900 ? -0.28 : -0.26;
        particleAnchor.scale.setScalar(window.innerWidth < 900 ? 0.68 : 0.84);
      };

      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('click', handleClick);
      window.addEventListener('resize', handleResize);
      handleResize();

      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const delta = Math.min(0.033, clock.getDelta());
        elapsedTime += delta;

        currentParallax.lerp(targetParallax, 0.045);
        camera.position.x += (currentParallax.x - camera.position.x) * 0.045;
        camera.position.y += (-currentParallax.y - camera.position.y) * 0.045;
        camera.lookAt(window.innerWidth < 900 ? 0.2 : 6.35, -0.22, 0);

        burstStrength *= 0.935;

        if (pointsMesh && particleState) {
          const { basePositions, positions, velocity, life } = particleState;
          const cycle = (elapsedTime % particleCycleDuration) / particleCycleDuration;
          const open = cycle < 0.48 ? 0 : Math.min(1, (cycle - 0.48) / 0.13);
          const close = cycle < 0.76 ? 0 : Math.min(1, (cycle - 0.76) / 0.18);
          const automaticSpread = Math.sin(open * Math.PI * 0.5) * (1 - close * close);
          const spreadBoost = automaticSpread * 2.75 + burstStrength * 5.4;
          const flow = 0.12 + automaticSpread * 0.58 + burstStrength * 1.55;

          for (let index = 0; index < life.length; index += 1) {
            const phase = life[index];
            const pulse = 0.25 + Math.sin(elapsedTime * 2.15 + phase) * 0.14;
            const drift = spreadBoost * (0.68 + Math.sin(phase) * 0.12);
            const offset = index * 3;
            const jitter = automaticSpread > 0 || burstStrength > 0.02 ? 0.032 : 0.006;
            const rightFlow = window.innerWidth < 900 ? 0 : spreadBoost * 0.18;
            const topGuard = window.innerWidth < 900 ? 3.8 : 3.0;

            positions[offset] = basePositions[offset] + velocity[offset] * drift + rightFlow + Math.sin(elapsedTime * 0.7 + phase) * jitter;
            positions[offset + 1] = Math.min(
              basePositions[offset + 1] + velocity[offset + 1] * drift + Math.cos(elapsedTime * 0.9 + phase) * jitter,
              topGuard,
            );
            positions[offset + 2] = basePositions[offset + 2] + velocity[offset + 2] * drift + pulse * flow * 0.08;
          }

          const breath = 1 + Math.sin(elapsedTime * 1.5) * 0.035;
          pointsMesh.scale.set(breath * 1.16, breath, breath);
          pointsMesh.rotation.y = 0.1 + Math.sin(elapsedTime * 0.38) * 0.026;
          pointsMesh.rotation.x = -0.18 + Math.sin(elapsedTime * 0.45) * 0.018;
          pointsMesh.rotation.z = THREE.MathUtils.degToRad(-65);
          pointsMesh.geometry.attributes.position.needsUpdate = true;
          material.size = 0.084 + Math.sin(elapsedTime * 1.8) * 0.007 + burstStrength * 0.014;
          if (edgeMesh) {
            edgeMesh.scale.set(breath * 1.17, breath * 1.012, breath * 1.012);
            edgeMesh.rotation.copy(pointsMesh.rotation);
            edgeMaterial.size = material.size * 1.34;
            edgeMaterial.opacity = 0.1 + (1 - automaticSpread) * 0.12;
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frame);
        geometry.dispose();
        material.dispose();
        edgeMaterial.dispose();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 overflow-hidden bg-black pointer-events-none" aria-hidden="true" />;
}
