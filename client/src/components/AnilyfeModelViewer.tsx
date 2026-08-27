import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

type AnilyfeModelViewerProps = {
  label: string;
  modelUrl: string;
  reducedMotion: boolean;
};

function disposeObject(root: THREE.Object3D) {
  root.traverse((node: THREE.Object3D) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials: THREE.Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material: THREE.Material) => material.dispose());
  });
}

export default function AnilyfeModelViewer({ label, modelUrl, reducedMotion }: AnilyfeModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Preparing 3D preview");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(3.5, 2.65, 5.8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-label", `${label} interactive 3D preview`);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 8;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.7;
    controls.target.set(0, 0.9, 0);

    scene.add(new THREE.HemisphereLight(0xf4efff, 0x7e697f, 2.45));
    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(4, 5, 5);
    key.castShadow = true;
    scene.add(key);
    const blush = new THREE.PointLight(0xffb5c5, 3.5, 11);
    blush.position.set(-2.6, 2.3, 2.8);
    scene.add(blush);
    const mint = new THREE.PointLight(0xb9ebd8, 3.1, 9);
    mint.position.set(2.2, 1.8, -2.3);
    scene.add(mint);
    const base = new THREE.Mesh(
      new THREE.CircleGeometry(2.25, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }),
    );
    base.rotation.x = -Math.PI / 2;
    scene.add(base);

    let raf = 0;
    let disposed = false;
    let activeModel: THREE.Group | null = null;
    let modelBaseY = 0;
    let previousFrameSeconds = performance.now() / 1000;
    let elapsedSeconds = 0;

    const resize = () => {
      const width = mount.clientWidth || 420;
      const height = mount.clientHeight || 360;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const loader = new GLTFLoader();
    setStatus("Loading GLB model");
    loader.load(
      modelUrl,
      (gltf: GLTF) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        activeModel = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(activeModel);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        activeModel.position.sub(center);
        activeModel.position.y += size.y * 0.46;
        activeModel.scale.setScalar(2.22 / Math.max(size.x, size.y, size.z, 1));
        modelBaseY = activeModel.position.y;
        activeModel.traverse((node: THREE.Object3D) => {
          const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        scene.add(activeModel);
        setStatus(reducedMotion ? "GLB loaded. Drag to rotate and scroll to zoom." : "GLB loaded. Drag to rotate and scroll to zoom.");
      },
      undefined,
      () => setStatus("The 3D model could not be loaded. Please try again."),
    );

    const render = (frameMilliseconds: number) => {
      const frameSeconds = frameMilliseconds / 1000;
      const deltaSeconds = Math.min(frameSeconds - previousFrameSeconds, 0.05);
      previousFrameSeconds = frameSeconds;
      elapsedSeconds += Math.max(deltaSeconds, 0);
      controls.update(deltaSeconds);
      if (activeModel && !reducedMotion) {
        activeModel.position.y = modelBaseY + Math.sin(elapsedSeconds * 1.1) * 0.035;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      if (activeModel) disposeObject(activeModel);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [label, modelUrl, reducedMotion]);

  return (
    <div className="model-viewer-shell">
      <div className="model-viewer-stage" ref={mountRef} />
      <p className="model-viewer-status" aria-live="polite">{status}</p>
      <p className="model-viewer-hint">Interactive 3D product preview</p>
    </div>
  );
}
