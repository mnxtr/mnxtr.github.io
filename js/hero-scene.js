import * as THREE from 'three';
// Optional ornament: the adjacent HTML carries the complete workflow.
export function initHeroScene(container) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const viewport = window.matchMedia('(min-width: 901px)');
  if (motion.matches || !viewport.matches) {
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 5;
  const geometry = new THREE.IcosahedronGeometry(0.8, 0);
  const material = new THREE.MeshBasicMaterial({ color: 0x73f6d2, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  let frame = 0;
  let visible = true;
  let disposed = false;
  let last = 0;
  const animate = (time) => {
    frame = 0;
    if (disposed || !visible || document.hidden) {
      return;
    }
    if (time - last >= 33) {
      mesh.rotation.y = time * 0.00012;
      mesh.rotation.x = 0.25;
      renderer.render(scene, camera);
      last = time;
    }
    frame = requestAnimationFrame(animate);
  };
  const resume = () => {
    if (!disposed && !frame && visible && !document.hidden) {
      frame = requestAnimationFrame(animate);
    }
  };
  const resize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  const resizeObserver = new ResizeObserver(resize);
  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', resume);
    motion.removeEventListener('change', dispose);
    viewport.removeEventListener('change', dispose);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  observer.observe(container);
  resizeObserver.observe(container);
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pagehide', dispose, { once: true });
  motion.addEventListener('change', dispose, { once: true });
  viewport.addEventListener('change', dispose, { once: true });
  resize();
  resume();
}
