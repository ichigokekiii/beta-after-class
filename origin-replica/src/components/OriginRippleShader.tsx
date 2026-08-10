"use client";

import { useEffect, useRef } from "react";
import {
  HERO_BACKGROUND_SRC,
  RIPPLE,
  WAITLIST_SUCCESS_EVENT,
} from "@/lib/animation-timeline";
import { easeGlide, easeLazy } from "@/lib/easing";
import { createRenderLoop } from "@/lib/render-loop";

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform float u_zoom;
uniform float u_parallaxX;
uniform float u_fringeAmount;
uniform float u_fringeStart;
uniform float u_fringeDistort;
uniform float u_orbAmount;

vec2 coverUV(vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float imageAspect = u_imageResolution.x / u_imageResolution.y;
  vec2 scale = canvasAspect < imageAspect
    ? vec2(canvasAspect / imageAspect, 1.0)
    : vec2(1.0, imageAspect / canvasAspect);
  return (uv - 0.5) * scale + 0.5;
}

vec3 sampleTexel(vec2 uv) {
  return texture2D(u_image, clamp(uv, 0.0, 1.0)).rgb;
}

vec3 sampleScene(vec2 uv, vec2 fringeOffset) {
  vec3 c;
  c.r = sampleTexel(uv + fringeOffset).r;
  c.g = sampleTexel(uv).g;
  c.b = sampleTexel(uv - fringeOffset).b;
  return c;
}

void main() {
  vec2 dir = v_uv - 0.5;
  dir.x *= u_resolution.x / u_resolution.y;
  float r = length(dir);
  vec2 nd = normalize(dir + 1e-5);

  vec2 c = (coverUV(v_uv) - 0.5) / u_zoom;
  float rs2 = r * r;
  c *= 1.0 - u_orbAmount * rs2;
  vec2 uv = c + 0.5;
  uv.x += u_parallaxX;

  float fringe = smoothstep(u_fringeStart, u_fringeStart + 0.55, r);
  uv -= nd * fringe * fringe * u_fringeDistort;
  vec2 fringeOffset = nd * fringe * u_fringeAmount;
  vec3 base = sampleScene(uv, fringeOffset);

  float leakY = gl_FragCoord.y / u_resolution.y;
  float leak = smoothstep(0.15, 0.0, leakY);
  vec3 light = vec3(1.0, 0.85, 0.6) * leak * 0.55;
  vec3 color = min(base / max(1.0 - light, vec3(1e-4)), vec3(1.0));

  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Origin ripple shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Origin ripple shader link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type Props = {
  src?: string;
  className?: string;
  onReady?: () => void;
};

export function OriginRippleShader({
  src = HERO_BACKGROUND_SRC,
  className,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const program = link(gl);
    if (!program) return;

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uniforms = {
      image: gl.getUniformLocation(program, "u_image"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      imageResolution: gl.getUniformLocation(program, "u_imageResolution"),
      zoom: gl.getUniformLocation(program, "u_zoom"),
      parallaxX: gl.getUniformLocation(program, "u_parallaxX"),
      fringeAmount: gl.getUniformLocation(program, "u_fringeAmount"),
      fringeStart: gl.getUniformLocation(program, "u_fringeStart"),
      fringeDistort: gl.getUniformLocation(program, "u_fringeDistort"),
      orbAmount: gl.getUniformLocation(program, "u_orbAmount"),
    };

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const texture = gl.createTexture();
    let ready = false;
    let imgW = 1;
    let imgH = 1;
    let start = 0;
    const pulses: number[] = [];
    let targetParallax = 0;
    let parallax = 0;
    let disposed = false;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.image, 0);
    gl.uniform1f(uniforms.fringeAmount, RIPPLE.fringeAmount);
    gl.uniform1f(uniforms.fringeStart, RIPPLE.fringeStart);
    gl.uniform1f(uniforms.fringeDistort, RIPPLE.fringeDistort);
    gl.uniform1f(uniforms.orbAmount, RIPPLE.orbAmount);

    const loop = createRenderLoop({
      canvas,
      render: (now) => {
        if (!ready || disposed) return;
        if (start === 0) start = now;
        const elapsed = now - start;
        let zoom =
          1 +
          (RIPPLE.zoomPeak - 1) *
            easeGlide(Math.min(elapsed / RIPPLE.zoomIntroMs, 1));
        if (elapsed > RIPPLE.zoomIntroMs) {
          const settle = Math.min(
            (elapsed - RIPPLE.zoomIntroMs) / RIPPLE.zoomSettleMs,
            1,
          );
          zoom =
            RIPPLE.zoomPeak +
            (RIPPLE.zoomSettle - RIPPLE.zoomPeak) * easeGlide(settle);
        }

        let pulse = 0;
        for (let i = pulses.length - 1; i >= 0; i--) {
          const t = Math.min((now - pulses[i]) / RIPPLE.submitPulseMs, 1);
          if (t >= 1) {
            pulses.splice(i, 1);
            continue;
          }
          pulse -=
            RIPPLE.submitPulseAmp *
            (t < 0.1
              ? easeGlide(t / 0.1)
              : 1 - easeLazy((t - 0.1) / 0.9));
        }

        parallax += (targetParallax - parallax) * 0.08;
        gl.uniform1f(uniforms.zoom, zoom + pulse);
        gl.uniform1f(uniforms.parallaxX, parallax);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      onResize: () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      },
    });

    const onSuccess = () => {
      pulses.push(performance.now());
      if (loop.reducedMotion) loop.renderOnce();
    };
    window.addEventListener(WAITLIST_SUCCESS_EVENT, onSuccess);

    const onMove = (e: PointerEvent) => {
      targetParallax =
        (e.clientX / window.innerWidth - 0.5) * RIPPLE.parallaxMax;
    };
    if (!loop.reducedMotion) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      imgW = img.naturalWidth || 1;
      imgH = img.naturalHeight || 1;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform2f(uniforms.imageResolution, imgW, imgH);
      ready = true;
      loop.enable();
      onReadyRef.current?.();
    };

    return () => {
      disposed = true;
      loop.dispose();
      window.removeEventListener(WAITLIST_SUCCESS_EVENT, onSuccess);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} />
  );
}
