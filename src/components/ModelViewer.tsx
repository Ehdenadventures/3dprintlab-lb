"use client";
import { useEffect, useRef, useState } from "react";

/** File types the 3D viewer can open. STL, 3MF and OBJ come from the slicer (Z up); GLB is Y up. */
export const MODEL_EXT = /\.(stl|3mf|obj|glb)(\?|#|$)/i;
export const MODEL_ACCEPT = ".stl,.3mf,.obj,.glb";
const extOf = (url: string) => (url.match(MODEL_EXT)?.[1] ?? "stl").toLowerCase();

/** Colour used when the product has no colours and the file has none (STL, OBJ). */
const DEFAULT_COLOUR = "#3b4bd1";

type Status = { state: "idle" | "loading" | "ready" | "error"; pct: number };

/**
 * Interactive 3D view of a product file (three.js). Drag to turn, pinch or scroll to zoom.
 * three.js is downloaded only when the viewer scrolls into view, so pages without it stay light.
 * `colour` (a hex) paints the model, so it follows the colour the customer picks.
 */
export default function ModelViewer({ url, colour, name = "Product", className = "" }: { url: string; colour?: string; name?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const paint = useRef<(hex?: string) => void>(() => {});
  const reset = useRef<() => void>(() => {});
  const colourRef = useRef(colour);
  const [status, setStatus] = useState<Status>({ state: "idle", pct: 0 });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    colourRef.current = colour;
    paint.current(colour);
  }, [colour]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let cancelled = false;
    let cleanup = () => {};

    async function start() {
      setStatus({ state: "loading", pct: 0 });
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (cancelled || !el) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.setAttribute("aria-label", `3D view of ${name}. Drag to turn, pinch to zoom.`);
      renderer.domElement.setAttribute("role", "img");
      el.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9cab, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(2, 3, 2.5);
      scene.add(key);

      const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.6;
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
        setTouched(true);
      });

      const size = () => {
        const w = el.clientWidth || 1, h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      // Draw only while the viewer is on screen.
      let visible = true;
      const tick = () => {
        controls.update();
        renderer.render(scene, camera);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        renderer.setAnimationLoop(visible ? tick : null);
      });
      io.observe(el);

      const owned: { dispose: () => void }[] = [];
      cleanup = () => {
        renderer.setAnimationLoop(null);
        io.disconnect();
        ro.disconnect();
        controls.dispose();
        owned.forEach((o) => o.dispose());
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };

      // Load the file.
      const ext = extOf(url);
      const onProgress = (e: ProgressEvent) => {
        if (e.lengthComputable && e.total) setStatus({ state: "loading", pct: Math.round((e.loaded / e.total) * 100) });
      };
      let object: import("three").Object3D;
      let hasOwnColours = false;
      if (ext === "glb") {
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        object = (await new GLTFLoader().loadAsync(url, onProgress)).scene;
        hasOwnColours = true;
      } else if (ext === "3mf") {
        const { ThreeMFLoader } = await import("three/addons/loaders/3MFLoader.js");
        object = await new ThreeMFLoader().loadAsync(url, onProgress);
        object.rotation.x = -Math.PI / 2;
        object.traverse((o) => {
          const m = (o as import("three").Mesh).material as import("three").MeshStandardMaterial | undefined;
          if (m && "color" in m && m.color.getHex() !== 0xffffff) hasOwnColours = true;
        });
      } else if (ext === "obj") {
        const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
        object = await new OBJLoader().loadAsync(url, onProgress);
        object.rotation.x = -Math.PI / 2;
      } else {
        const { STLLoader } = await import("three/addons/loaders/STLLoader.js");
        const geo = await new STLLoader().loadAsync(url, onProgress);
        object = new THREE.Mesh(geo);
        object.rotation.x = -Math.PI / 2;
      }
      if (cancelled) return cleanup();

      // One shared plastic-looking material, painted in the picked colour.
      const plastic = new THREE.MeshStandardMaterial({ color: DEFAULT_COLOUR, roughness: 0.55, metalness: 0.02 });
      owned.push(plastic);
      const originals = new Map<import("three").Mesh, import("three").Material | import("three").Material[]>();
      object.traverse((o) => {
        const mesh = o as import("three").Mesh;
        if (!mesh.isMesh) return;
        owned.push(mesh.geometry);
        if (!mesh.geometry.attributes.normal) mesh.geometry.computeVertexNormals();
        originals.set(mesh, mesh.material);
        if (!hasOwnColours) mesh.material = plastic;
      });
      paint.current = (hex) => {
        const useFile = hasOwnColours && !hex;
        plastic.color.set(hex || DEFAULT_COLOUR);
        originals.forEach((orig, mesh) => (mesh.material = useFile ? orig : plastic));
      };
      paint.current(colourRef.current);

      // Centre the model, sit it on a soft shadow and frame it.
      const holder = new THREE.Group();
      holder.add(object);
      scene.add(holder);
      object.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(object);
      const centre = bounds.getCenter(new THREE.Vector3());
      object.position.sub(centre);
      const dims = bounds.getSize(new THREE.Vector3());
      const radius = Math.max(dims.length() / 2, 1e-3);

      const shadowTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, "rgba(0,0,0,0.32)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
      );
      owned.push(shadowTex, shadow.geometry, shadow.material as import("three").Material);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -dims.y / 2 - radius * 0.01;
      shadow.scale.setScalar(Math.max(dims.x, dims.z) * 1.6);
      scene.add(shadow);

      const fov = (camera.fov * Math.PI) / 180;
      const dist = (radius / Math.sin(fov / 2)) * 1.15;
      camera.near = radius / 100;
      camera.far = radius * 100;
      camera.updateProjectionMatrix();
      controls.minDistance = radius * 1.2;
      controls.maxDistance = dist * 3;
      const home = new THREE.Vector3(Math.sin(0.6) * Math.cos(0.4), Math.sin(0.4), Math.cos(0.6) * Math.cos(0.4)).multiplyScalar(dist);
      reset.current = () => {
        camera.position.copy(home);
        controls.target.set(0, 0, 0);
        controls.autoRotate = true;
        controls.update();
      };
      reset.current();
      renderer.setAnimationLoop(visible ? tick : null);
      setStatus({ state: "ready", pct: 100 });
    }

    // Wait until the viewer is near the screen before downloading three.js and the file.
    const wait = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      wait.disconnect();
      start().catch((err) => {
        console.error("3D viewer:", err);
        cleanup();
        cleanup = () => {};
        if (!cancelled) setStatus({ state: "error", pct: 0 });
      });
    }, { rootMargin: "200px" });
    wait.observe(el);

    return () => {
      cancelled = true;
      wait.disconnect();
      cleanup();
      paint.current = () => {};
    };
  }, [url, name]);

  return (
    <div ref={box} className={`relative h-full w-full select-none overflow-hidden ${className}`}>
      {status.state !== "ready" && status.state !== "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-ink-3">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-accent" aria-hidden />
          <span>Loading 3D view{status.pct > 0 && status.pct < 100 ? ` ${status.pct}%` : "..."}</span>
        </div>
      )}
      {status.state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-3">
          The 3D view could not open on this device. The photos show the item.
        </div>
      )}
      {status.state === "ready" && (
        <>
          <span className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink-2 shadow-sm transition-opacity duration-500 ${touched ? "opacity-0" : "opacity-100"}`}>
            Drag to turn · pinch to zoom
          </span>
          <button type="button" onClick={() => reset.current()} aria-label="Reset the 3D view"
            className="absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-ink-2 shadow-sm hover:text-ink">
            Reset
          </button>
        </>
      )}
    </div>
  );
}
