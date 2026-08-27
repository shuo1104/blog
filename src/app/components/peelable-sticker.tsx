import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { cn } from "./ui/utils";
import { HandMetal, RefreshCw } from "lucide-react";

export interface PeelableStickerProps {
  text?: string;
  subtext?: string;
  handle?: string;
  badge?: string;
  width?: number;
  height?: number;
  stickerColor?: string;
  variant?: "standalone" | "embedded";
  className?: string;
}

export function PeelableSticker({
  text = "HELLO!",
  subtext = "PEEL ME ↗",
  handle = "@shuo",
  badge = "№ 0913 // VINYL",
  width,
  height,
  variant = "standalone",
  stickerColor = "#1a1c20",
  className,
}: PeelableStickerProps) {
  const isEmbedded = variant === "embedded";
  const finalWidth = width ?? (isEmbedded ? 260 : 420);
  const finalHeight = height ?? (isEmbedded ? 94 : 260);

  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [peelPercent, setPeelPercent] = useState(0);

  // Physics animation state
  const stateRef = useRef({
    isDragging: false,
    dragPoint: new THREE.Vector2(0, 0),
    targetDragPoint: new THREE.Vector2(0, 0),
    velocity: new THREE.Vector2(0, 0),
    targetHoverLift: 0,
    time: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const aspect = finalWidth / finalHeight;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(finalWidth, finalHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 1. High-Resolution Front Canvas Texture with Typographic Polish
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = 1024;
    frontCanvas.height = Math.round(1024 / aspect);
    const ctx = frontCanvas.getContext("2d");
    if (ctx) {
      const cw = frontCanvas.width;
      const ch = frontCanvas.height;

      // Dark Matte Vinyl background with subtle radial depth
      const bgGrad = ctx.createRadialGradient(
        cw * 0.48,
        ch * 0.45,
        20,
        cw * 0.5,
        ch * 0.5,
        cw * 0.7
      );
      bgGrad.addColorStop(0, "#2a2d34");
      bgGrad.addColorStop(0.55, "#1d1f24");
      bgGrad.addColorStop(1, "#121316");

      const radius = isEmbedded ? 38 : 50;
      ctx.beginPath();
      ctx.roundRect(14, 14, cw - 28, ch - 28, radius);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // Tactile micro-noise for authentic matte vinyl
      ctx.save();
      ctx.clip();
      const imgData = ctx.getImageData(0, 0, cw, ch);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 13;
        imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
        imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
        imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Ultra-fine die-cut highlight border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = isEmbedded ? 3.5 : 3;
      ctx.stroke();

      // Inner subtle contrast groove
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!isEmbedded) {
        // Top-Left Serial Tag in Micro Monospace
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.beginPath();
        ctx.roundRect(46, 44, 165, 34, 17);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#a8afbc";
        ctx.font = "bold 13px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.letterSpacing = "2.5px";
        ctx.fillText(badge, 62, 66);

        // Top-Right Grip Dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.beginPath();
            ctx.arc(cw - 76 + c * 10, 52 + r * 10, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Embedded micro typography: subtle top tag
        ctx.fillStyle = "#6b7280";
        ctx.font = "bold 13px ui-monospace, monospace";
        ctx.letterSpacing = "2px";
        ctx.fillText("№ 0429", 36, 46);

        // Embedded grip hint
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            ctx.beginPath();
            ctx.arc(cw - 42 + c * 8, 34 + r * 8, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // HIGH-IMPACT TYPOGRAPHY: "HELLO!" (Editorial Display Typography)
      const fontSize = isEmbedded ? 142 : 92;
      const textY = isEmbedded ? ch / 2 + 48 : ch / 2 + 10;

      ctx.save();
      // 1. Deep chiseled deboss shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowOffsetY = isEmbedded ? 5 : 4;
      ctx.shadowBlur = isEmbedded ? 6 : 4;

      // 2. Titanium metallic gradient text fill
      const textGrad = ctx.createLinearGradient(0, textY - fontSize, 0, textY);
      textGrad.addColorStop(0, "#eceff4");
      textGrad.addColorStop(0.4, "#cbd1dc");
      textGrad.addColorStop(0.75, "#8e96a6");
      textGrad.addColorStop(1, "#656c7c");

      ctx.fillStyle = textGrad;
      ctx.font = `900 ${fontSize}px Impact, Arial Black, -apple-system, sans-serif`;
      ctx.letterSpacing = isEmbedded ? "7px" : "5px";
      ctx.textAlign = "center";
      ctx.fillText(text, cw / 2, textY);
      ctx.restore();

      // 3. Crisp Top Specular Bevel
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.font = `900 ${fontSize}px Impact, Arial Black, -apple-system, sans-serif`;
      ctx.letterSpacing = isEmbedded ? "7px" : "5px";
      ctx.textAlign = "center";
      ctx.fillText(text, cw / 2, textY - 2);
      ctx.restore();

      // 4. Gold Star Sparkle Accent with Glow
      ctx.save();
      ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 44px -apple-system, sans-serif";
      ctx.fillText("✦", cw - (isEmbedded ? 104 : 154), textY - (isEmbedded ? 56 : 36));
      ctx.restore();

      if (!isEmbedded) {
        // Subtitle & Typographic Footer Rule
        ctx.fillStyle = "#636b7b";
        ctx.font = "600 16px ui-monospace, monospace";
        ctx.letterSpacing = "3px";
        ctx.fillText(subtext, cw / 2, ch / 2 + 54);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(46, ch - 76);
        ctx.lineTo(cw - 46, ch - 76);
        ctx.stroke();

        ctx.fillStyle = "#9ba3b2";
        ctx.font = "bold 18px ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.letterSpacing = "1.5px";
        ctx.fillText(handle, 50, ch - 44);

        ctx.fillStyle = "#636b7b";
        ctx.font = "bold 14px ui-monospace, monospace";
        ctx.textAlign = "right";
        ctx.fillText("TAP OR DRAG CORNER ↗", cw - 50, ch - 44);
      }

      ctx.restore();
    }

    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.anisotropy = 8;

    // 2. High-Specular Adhesive Back Texture
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 1024;
    backCanvas.height = Math.round(1024 / aspect);
    const bCtx = backCanvas.getContext("2d");
    if (bCtx) {
      const cw = backCanvas.width;
      const ch = backCanvas.height;

      const bGrad = bCtx.createLinearGradient(0, 0, cw, ch);
      bGrad.addColorStop(0, "#d8dce3");
      bGrad.addColorStop(0.3, "#f2f4f8");
      bGrad.addColorStop(0.5, "#cbd0d8");
      bGrad.addColorStop(0.7, "#e6eaf0");
      bGrad.addColorStop(1, "#b8bfc8");

      const radius = isEmbedded ? 38 : 50;
      bCtx.beginPath();
      bCtx.roundRect(14, 14, cw - 28, ch - 28, radius);
      bCtx.fillStyle = bGrad;
      bCtx.fill();

      // Adhesive micro-creases pattern
      bCtx.save();
      bCtx.clip();
      bCtx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      bCtx.lineWidth = 1.5;
      for (let x = -ch; x < cw + ch; x += 18) {
        bCtx.beginPath();
        bCtx.moveTo(x, 0);
        bCtx.lineTo(x + ch, ch);
        bCtx.stroke();
      }

      bCtx.strokeStyle = "rgba(0, 0, 0, 0.04)";
      bCtx.lineWidth = 2;
      for (let y = 0; y < ch; y += 32) {
        bCtx.beginPath();
        bCtx.moveTo(0, y);
        bCtx.lineTo(cw, y);
        bCtx.stroke();
      }
      bCtx.restore();
    }

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.anisotropy = 8;

    // 3. Subdivided Plane Mesh
    const planeWidth = 2.6;
    const planeHeight = planeWidth / aspect;
    const segmentsX = 84;
    const segmentsY = Math.round(84 / aspect);
    const stickerGeometry = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      segmentsX,
      segmentsY
    );

    const originalPositions = stickerGeometry.attributes.position.clone();

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.58,
      metalness: 0.2,
      side: THREE.FrontSide,
      transparent: true,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.18,
      metalness: 0.52,
      side: THREE.BackSide,
      transparent: true,
    });

    const frontMesh = new THREE.Mesh(stickerGeometry, frontMaterial);
    const backMesh = new THREE.Mesh(stickerGeometry, backMaterial);
    const stickerGroup = new THREE.Group();
    stickerGroup.add(frontMesh);
    stickerGroup.add(backMesh);
    scene.add(stickerGroup);

    // 4. Dynamic Shadow Mesh
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 10, 256, 256, 240);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
      grad.addColorStop(0.35, "rgba(0, 0, 0, 0.35)");
      grad.addColorStop(0.7, "rgba(0, 0, 0, 0.1)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(planeWidth * 1.5, planeHeight * 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, 0, -0.015);
    scene.add(shadowMesh);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.9);
    dirLight1.position.set(2.5, 3.5, 4.0);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90a5c0, 0.85);
    dirLight2.position.set(-3.0, -2.0, 2.5);
    scene.add(dirLight2);

    // 6. Paper Curl & Fold Physics
    const posAttr = stickerGeometry.attributes.position;
    const origPos = originalPositions.array as Float32Array;
    const currentPos = posAttr.array as Float32Array;
    const corner = new THREE.Vector2(planeWidth / 2, planeHeight / 2);
    const curlRadius = 0.25;

    function applyPeelFold(dragOffset: THREE.Vector2) {
      const dragLen = dragOffset.length();

      if (dragLen <= 0.005) {
        for (let i = 0; i < origPos.length; i++) {
          currentPos[i] = origPos[i];
        }
        posAttr.needsUpdate = true;
        stickerGeometry.computeVertexNormals();
        shadowMat.opacity = 0;
        return;
      }

      const dir = dragOffset.clone().normalize();
      const maxDist = dragLen;
      const foldDist = maxDist * 0.5;

      for (let i = 0; i < origPos.length; i += 3) {
        const ox = origPos[i];
        const oy = origPos[i + 1];

        const vx = ox - corner.x;
        const vy = oy - corner.y;

        const proj = vx * dir.x + vy * dir.y;
        const distFromFold = proj + foldDist;

        if (distFromFold <= -curlRadius) {
          const foldOffset = 2.0 * distFromFold;
          currentPos[i] = ox - dir.x * foldOffset;
          currentPos[i + 1] = oy - dir.y * foldOffset;
          currentPos[i + 2] = 2.0 * curlRadius + Math.abs(distFromFold) * 0.08;
        } else if (distFromFold < curlRadius) {
          const t = (distFromFold + curlRadius) / (2.0 * curlRadius);
          const angle = (1.0 - t) * Math.PI;
          const lift = curlRadius * Math.sin(angle);
          const roll = (1.0 - t) * 2.0 * curlRadius;

          currentPos[i] = ox + dir.x * (roll - (curlRadius - distFromFold));
          currentPos[i + 1] = oy + dir.y * (roll - (curlRadius - distFromFold));
          currentPos[i + 2] = lift;
        } else {
          currentPos[i] = ox;
          currentPos[i + 1] = oy;
          currentPos[i + 2] = 0;
        }
      }

      posAttr.needsUpdate = true;
      stickerGeometry.computeVertexNormals();

      const progress = Math.min(1.0, dragLen / Math.hypot(planeWidth, planeHeight));
      shadowMat.opacity = Math.min(0.65, progress * 0.9);
      shadowMesh.position.set(
        corner.x + dir.x * foldDist * 0.8,
        corner.y + dir.y * foldDist * 0.8,
        -0.015
      );
      shadowMesh.scale.set(1.0 + progress * 0.4, 1.0 + progress * 0.4, 1.0);
    }

    // 7. Redesigned Damped Spring Physics Loop (Crisp & Tactile)
    let animationFrameId: number;
    let lastTime = performance.now();
    const springK = 260; // Snappy return spring
    const springDamping = 20;

    function animate(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const state = stateRef.current;
      state.time += dt;

      const target = state.isDragging
        ? state.targetDragPoint
        : state.targetDragPoint.clone().multiplyScalar(state.targetHoverLift);

      const diffX = target.x - state.dragPoint.x;
      const diffY = target.y - state.dragPoint.y;

      const forceX = diffX * springK - state.velocity.x * springDamping;
      const forceY = diffY * springK - state.velocity.y * springDamping;

      state.velocity.x += forceX * dt;
      state.velocity.y += forceY * dt;

      state.dragPoint.x += state.velocity.x * dt;
      state.dragPoint.y += state.velocity.y * dt;

      applyPeelFold(state.dragPoint);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    // 8. Event Handlers
    function getPointerWorld(e: MouseEvent | TouchEvent) {
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const wx = (nx * planeWidth) / 2;
      const wy = (ny * planeHeight) / 2;
      return new THREE.Vector2(wx, wy);
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      const p = getPointerWorld(e);
      const maxDiag = Math.hypot(planeWidth, planeHeight);

      stateRef.current.isDragging = true;
      setIsDragging(true);

      const offset = new THREE.Vector2().subVectors(p, corner);
      if (offset.length() > maxDiag * 1.1) {
        offset.setLength(maxDiag * 1.1);
      }
      stateRef.current.targetDragPoint.copy(offset);
      setPeelPercent(Math.round((offset.length() / maxDiag) * 100));
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const p = getPointerWorld(e);
      const maxDiag = Math.hypot(planeWidth, planeHeight);

      if (stateRef.current.isDragging) {
        e.stopPropagation();
        const offset = new THREE.Vector2().subVectors(p, corner);
        if (offset.length() > maxDiag * 1.1) {
          offset.setLength(maxDiag * 1.1);
        }
        stateRef.current.targetDragPoint.copy(offset);
        setPeelPercent(Math.round((offset.length() / maxDiag) * 100));
      } else {
        const distToCorner = corner.distanceTo(p);
        if (distToCorner < 1.0) {
          stateRef.current.targetDragPoint.set(-0.32, -0.32);
          stateRef.current.targetHoverLift = 1.0;
        } else {
          stateRef.current.targetHoverLift = 0;
        }
      }
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
      stateRef.current.targetDragPoint.set(0, 0);
      stateRef.current.targetHoverLift = 0;
      setIsDragging(false);
      setPeelPercent(0);
    };

    const onMouseLeave = () => {
      stateRef.current.isDragging = false;
      stateRef.current.targetDragPoint.set(0, 0);
      stateRef.current.targetHoverLift = 0;
      setIsDragging(false);
      setPeelPercent(0);
    };

    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    container.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);

      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      container.removeEventListener("mouseleave", onMouseLeave);

      renderer.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      shadowTexture.dispose();
      stickerGeometry.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      shadowMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [finalWidth, finalHeight, text, subtext, handle, badge, stickerColor, isEmbedded]);

  const handleReset = () => {
    stateRef.current.targetDragPoint.set(0, 0);
    stateRef.current.velocity.set(-8, -8);
  };

  if (isEmbedded) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center select-none overflow-visible",
          className
        )}
      >
        <div
          ref={mountRef}
          className={cn(
            "relative cursor-grab active:cursor-grabbing touch-none flex items-center justify-center overflow-visible",
            isDragging && "cursor-grabbing"
          )}
          style={{ width: finalWidth, height: finalHeight }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none",
        "p-6 sm:p-8 rounded-3xl",
        "bg-gradient-to-b from-[#181a1e] via-[#121417] to-[#0c0d0f]",
        "border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-15 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 65%)",
        }}
      />

      <div
        ref={mountRef}
        className={cn(
          "relative cursor-grab active:cursor-grabbing touch-none flex items-center justify-center overflow-visible",
          isDragging && "cursor-grabbing"
        )}
        style={{ width: finalWidth, height: finalHeight }}
      />

      <div className="mt-4 flex w-full max-w-[420px] items-center justify-between px-2 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <HandMetal className="size-3.5 text-neutral-400" />
          <span>{isDragging ? "PEELING..." : "DRAG TOP-RIGHT TO PEEL"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular-nums text-neutral-500">
            {peelPercent > 0 ? `${peelPercent}% PEEL` : "ADHERED"}
          </span>
          <button
            onClick={handleReset}
            title="Snap back"
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3" />
            <span>SNAP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
