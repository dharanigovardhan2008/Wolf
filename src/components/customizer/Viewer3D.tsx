"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { DesignElement, ImageElement, TextElement, Side } from "@/stores/customizerStore";

const CANVAS_SIZE = 1024;
const FONTS = {
  "Inter": "Inter, sans-serif",
  "Oswald": "Oswald, sans-serif",
  "Roboto": "Roboto, sans-serif",
  "Bebas Neue": "'Bebas Neue', sans-serif",
  "Montserrat": "Montserrat, sans-serif",
  "Space Mono": "'Space Mono', monospace",
};

function drawDesignToCanvas(
  canvas: HTMLCanvasElement,
  elements: DesignElement[],
  shirtColor: string
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // Clear
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Background (shirt color)
  ctx.fillStyle = shirtColor;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw elements
  for (const el of elements) {
    ctx.save();
    ctx.globalAlpha = el.opacity;

    const cx = el.x + (el.width ?? 0) / 2;
    const cy = el.y + (el.height ?? 0) / 2;
    ctx.translate(cx, cy);
    ctx.rotate((el.rotation * Math.PI) / 180);

    if (el.type === "image") {
      const imgEl = el as ImageElement;
      // Images are drawn from a preloaded source
      const img = document.getElementById(`img-cache-${el.id}`) as HTMLImageElement;
      if (img && img.complete) {
        ctx.drawImage(img, -imgEl.width / 2, -imgEl.height / 2, imgEl.width, imgEl.height);
      }
    } else if (el.type === "text") {
      const textEl = el as TextElement;
      const fontFamily = FONTS[textEl.fontFamily as keyof typeof FONTS] ?? textEl.fontFamily;
      ctx.font = `${textEl.fontStyle} ${textEl.fontWeight} ${textEl.fontSize}px ${fontFamily}`;
      ctx.fillStyle = textEl.fill;
      ctx.textAlign = textEl.textAlign;
      ctx.letterSpacing = `${textEl.letterSpacing}px`;
      ctx.fillText(textEl.content, 0, textEl.fontSize / 3);
    }

    ctx.restore();
  }
}

// T-shirt geometry procedural fallback
function ProceduralShirt({
  shirtColor,
  frontElements,
  backElements,
  currentSide,
  textureVersion,
}: {
  shirtColor: string;
  frontElements: DesignElement[];
  backElements: DesignElement[];
  currentSide: Side;
  textureVersion: number;
}) {
  const frontCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const backCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frontMeshRef = useRef<THREE.Mesh>(null);
  const backMeshRef = useRef<THREE.Mesh>(null);

  // Initialize textures
  useEffect(() => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    frontCanvas.width = CANVAS_SIZE;
    frontCanvas.height = CANVAS_SIZE;
    backCanvas.width = CANVAS_SIZE;
    backCanvas.height = CANVAS_SIZE;

    const ft = new THREE.CanvasTexture(frontCanvas);
    const bt = new THREE.CanvasTexture(backCanvas);
    frontTextureRef.current = ft;
    backTextureRef.current = bt;

    if (frontMeshRef.current) {
      (frontMeshRef.current.material as THREE.MeshStandardMaterial).map = ft;
    }
    if (backMeshRef.current) {
      (backMeshRef.current.material as THREE.MeshStandardMaterial).map = bt;
    }
  }, []);

  // Update textures when design changes
  useEffect(() => {
    drawDesignToCanvas(frontCanvasRef.current, frontElements, shirtColor);
    if (frontTextureRef.current) frontTextureRef.current.needsUpdate = true;
  }, [frontElements, shirtColor, textureVersion]);

  useEffect(() => {
    drawDesignToCanvas(backCanvasRef.current, backElements, shirtColor);
    if (backTextureRef.current) backTextureRef.current.needsUpdate = true;
  }, [backElements, shirtColor, textureVersion]);

  const shirtColorObj = new THREE.Color(shirtColor);

  return (
    <group>
      {/* Body */}
      <mesh ref={frontMeshRef} position={[0, 0, 0.01]}>
        <boxGeometry args={[2.2, 2.8, 0.05]} />
        <meshStandardMaterial color={shirtColorObj} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Sleeve Left */}
      <mesh position={[-1.5, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.9, 0.8, 0.05]} />
        <meshStandardMaterial color={shirtColorObj} roughness={0.9} />
      </mesh>

      {/* Sleeve Right */}
      <mesh position={[1.5, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.9, 0.8, 0.05]} />
        <meshStandardMaterial color={shirtColorObj} roughness={0.9} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 1.5, 0.02]}>
        <torusGeometry args={[0.35, 0.08, 8, 24, Math.PI]} />
        <meshStandardMaterial color={shirtColorObj} roughness={0.9} />
      </mesh>

      {/* Front Design Overlay */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.8, 2.4]} />
        <meshStandardMaterial
          transparent
          roughness={1}
          metalness={0}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

// Camera controller
function CameraController({ currentSide }: { currentSide: Side }) {
  const { camera } = useThree();
  useEffect(() => {
    if (currentSide === "front") {
      camera.position.set(0, 0, 5);
    } else {
      camera.position.set(0, 0, -5);
      camera.lookAt(0, 0, 0);
    }
  }, [currentSide, camera]);
  return null;
}

// Canvas-based 2D design preview (reliable, works without 3D model)
function DesignPreview({
  shirtColor,
  frontElements,
  backElements,
  currentSide,
  textureVersion,
}: {
  shirtColor: string;
  frontElements: DesignElement[];
  backElements: DesignElement[];
  currentSide: Side;
  textureVersion: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elements = currentSide === "front" ? frontElements : backElements;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    drawDesignToCanvas(canvas, elements, shirtColor);
  }, [elements, shirtColor, textureVersion, currentSide]);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-8">
      {/* T-shirt silhouette SVG */}
      <div className="relative max-w-md w-full">
        <svg
          viewBox="0 0 400 480"
          className="w-full"
          aria-hidden="true"
        >
          {/* T-shirt shape */}
          <path
            d="M 80 40 L 130 10 L 175 40 Q 200 20 225 40 L 270 10 L 320 40 L 370 120 L 310 140 L 310 460 L 90 460 L 90 140 L 30 120 Z"
            fill={shirtColor}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Collar */}
          <path
            d="M 175 40 Q 200 65 225 40"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          {/* Print area indicator */}
          <rect
            x="120"
            y="100"
            width="160"
            height="200"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="6,4"
          />
        </svg>

        {/* Design canvas overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative overflow-hidden rounded"
            style={{
              width: "42%",
              paddingBottom: "52%",
              marginTop: "22%",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ imageRendering: "pixelated" }}
              aria-label={`Design preview for ${currentSide} of shirt`}
            />
          </div>
        </div>

        {/* Side label */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-xs text-white/60 uppercase tracking-widest">
          {currentSide}
        </div>
      </div>
    </div>
  );
}

interface Viewer3DProps {
  shirtColor: string;
  frontElements: DesignElement[];
  backElements: DesignElement[];
  currentSide: Side;
  textureVersion: number;
}

export function Viewer3D({
  shirtColor,
  frontElements,
  backElements,
  currentSide,
  textureVersion,
}: Viewer3DProps) {
  // Image cache for canvas drawing
  const allElements = [...frontElements, ...backElements];
  const imageElements = allElements.filter((el) => el.type === "image") as ImageElement[];

  return (
    <div className="w-full h-full relative bg-zinc-900/50">
      {/* Hidden image cache for canvas drawing */}
      <div className="sr-only" aria-hidden="true">
        {imageElements.map((el) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={el.id}
            id={`img-cache-${el.id}`}
            src={el.src}
            alt=""
            crossOrigin="anonymous"
          />
        ))}
      </div>

      {/* 2D Preview (primary) */}
      <DesignPreview
        shirtColor={shirtColor}
        frontElements={frontElements}
        backElements={backElements}
        currentSide={currentSide}
        textureVersion={textureVersion}
      />

      {/* 3D Canvas (overlay for WebGL) */}
      <div className="absolute inset-0 opacity-0 pointer-events-none">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <p className="text-xs text-white/30 text-center">
          Add elements from the design panel →
        </p>
      </div>
    </div>
  );
}
