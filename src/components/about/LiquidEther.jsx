"use client";
import { useEffect, useRef } from "react";
import "./liquid-ether.css";

// ─── Shaders ─────────────────────────────────────────────────────────────────

const BASE_VERT = `precision highp float;
attribute vec2 aPosition;
varying vec2 vUv,vL,vR,vT,vB;
uniform vec2 texelSize;
void main(){
  vUv=aPosition*.5+.5;
  vL=vUv-vec2(texelSize.x,0.); vR=vUv+vec2(texelSize.x,0.);
  vT=vUv+vec2(0.,texelSize.y); vB=vUv-vec2(0.,texelSize.y);
  gl_Position=vec4(aPosition,0.,1.);
}`;

const SIMPLE_VERT = `precision highp float;
attribute vec2 aPosition; varying vec2 vUv;
void main(){ vUv=aPosition*.5+.5; gl_Position=vec4(aPosition,0.,1.); }`;

const ADVECT_FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity,uSource;
uniform vec2 texelSize,dyeTexelSize;
uniform float dt,dissipation;
vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){
  vec2 st=uv/ts-.5; vec2 ij=floor(st); vec2 f=fract(st);
  vec4 a=texture2D(s,(ij+vec2(.5,.5))*ts),b=texture2D(s,(ij+vec2(1.5,.5))*ts);
  vec4 c=texture2D(s,(ij+vec2(.5,1.5))*ts),d=texture2D(s,(ij+vec2(1.5,1.5))*ts);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main(){
  vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
  gl_FragColor=dissipation*bilerp(uSource,coord,dyeTexelSize);
}`;

const DIVERGENCE_FRAG = `precision mediump float;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x;
  float T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;
  gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);
}`;

const PRESSURE_FRAG = `precision mediump float;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uPressure,uDivergence;
void main(){
  float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;
  float div=texture2D(uDivergence,vUv).x;
  gl_FragColor=vec4((L+R+B+T-div)*.25,0.,0.,1.);
}`;

const GRADIENT_FRAG = `precision mediump float;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uPressure,uVelocity;
void main(){
  float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;
  vec2 vel=texture2D(uVelocity,vUv).xy;
  gl_FragColor=vec4(vel-vec2(R-L,T-B),0.,1.);
}`;

const VISCOUS_FRAG = `precision mediump float;
varying highp vec2 vUv,vL,vR,vT,vB;
uniform sampler2D uVelocity;
uniform float alpha,rBeta;
void main(){
  vec2 L=texture2D(uVelocity,vL).xy,R=texture2D(uVelocity,vR).xy;
  vec2 T=texture2D(uVelocity,vT).xy,B=texture2D(uVelocity,vB).xy;
  vec2 C=texture2D(uVelocity,vUv).xy;
  gl_FragColor=vec4((L+R+T+B+alpha*C)*rBeta,0.,1.);
}`;

const SPLAT_FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio,radius;
uniform vec3 color; uniform vec2 point;
void main(){
  vec2 p=vUv-point; p.x*=aspectRatio;
  vec3 splat=exp(-dot(p,p)/radius)*color;
  gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+splat,1.);
}`;

// Display: fluid dye composited over solid white background
const DISPLAY_FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
void main(){
  vec3 c=texture2D(uTexture,vUv).rgb;
  float intensity=length(c);
  float a=smoothstep(0.01,1.4,intensity)*0.18;
  vec3 col=c/max(intensity,0.001);
  vec3 final=mix(vec3(1.0),col,a);
  gl_FragColor=vec4(final,1.0);
}`;

// ─── WebGL helpers ────────────────────────────────────────────────────────────

function makeCtx(canvas) {
  // Prefer WebGL2 for float-texture render-target support
  let gl = canvas.getContext("webgl2");
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return null;

  let halfType, linearOk;
  if (isGL2) {
    gl.getExtension("EXT_color_buffer_float");
    linearOk = !!gl.getExtension("OES_texture_float_linear");
    halfType  = gl.HALF_FLOAT;
  } else {
    const hf = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    gl.getExtension("WEBGL_color_buffer_float");
    linearOk = !!gl.getExtension("OES_texture_half_float_linear");
    halfType  = hf ? hf.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
  }
  const fmt = isGL2
    ? { i: gl.RGBA16F, f: gl.RGBA }
    : { i: gl.RGBA,    f: gl.RGBA };

  return { gl, isGL2, halfType, linearOk, fmt };
}

function mkProg(gl, vs, fs) {
  const make = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  const u = {};
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function mkFBO(gl, w, h, fmt, type, filter) {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.i, w, h, 0, fmt.f, type, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
  const tx = 1/w, ty = 1/h;
  return {
    tex, fbo, w, h, tx, ty,
    bind(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
  };
}

function mkDouble(gl, w, h, fmt, type, filter) {
  let a = mkFBO(gl, w, h, fmt, type, filter);
  let b = mkFBO(gl, w, h, fmt, type, filter);
  return {
    get r(){ return a; }, get w(){ return b; },
    swap(){ [a,b]=[b,a]; },
    get tx(){ return a.tx; }, get ty(){ return a.ty; }
  };
}

function hexRgb(h) {
  return {
    r: parseInt(h.slice(1,3),16)/255,
    g: parseInt(h.slice(3,5),16)/255,
    b: parseInt(h.slice(5,7),16)/255,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiquidEther({
  colors      = ["#5227FF","#FF9FFC","#B497CF"],
  mouseForce  = 20,
  cursorSize  = 100,
  isViscous   = false,
  viscous     = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution  = 0.5,
  autoDemo    = false,
  autoSpeed   = 0.5,
  autoIntensity = 2.2,
  autoResumeDelay = 3000,
  color0, color1, color2,
}) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);

  // Keep a live ref to props so the loop always reads current values
  const p = useRef({});
  p.current = {
    mouseForce, cursorSize, isViscous, viscous,
    iterationsViscous, iterationsPoisson, resolution,
    autoDemo, autoSpeed, autoIntensity, autoResumeDelay,
    cols: [color0||colors[0], color1||colors[1], color2||colors[2]],
  };

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = makeCtx(canvas);
    if (!ctx) return;
    const { gl, halfType, linearOk, fmt } = ctx;

    // No GL blending — splat accumulates in-shader; display outputs opaque white

    // ── Fullscreen quad ──
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);

    function bindQuad(prog) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
      const loc = gl.getAttribLocation(prog.p, "aPosition");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    // ── Programs ──
    const advectProg    = mkProg(gl, BASE_VERT, ADVECT_FRAG);
    const divProg       = mkProg(gl, BASE_VERT, DIVERGENCE_FRAG);
    const presProg      = mkProg(gl, BASE_VERT, PRESSURE_FRAG);
    const gradProg      = mkProg(gl, BASE_VERT, GRADIENT_FRAG);
    const viscProg      = mkProg(gl, BASE_VERT, VISCOUS_FRAG);
    const splatProg     = mkProg(gl, BASE_VERT, SPLAT_FRAG);
    const displayProg   = mkProg(gl, SIMPLE_VERT, DISPLAY_FRAG);

    const filter = linearOk ? gl.LINEAR : gl.NEAREST;

    // ── FBOs ──
    let vel, dye, pres, div;

    function initFBOs() {
      const { resolution: res } = p.current;
      const sw = Math.max(1, Math.round(canvas.width  * res));
      const sh = Math.max(1, Math.round(canvas.height * res));
      const dw = canvas.width, dh = canvas.height;
      vel  = mkDouble(gl, sw, sh, fmt, halfType, filter);
      dye  = mkDouble(gl, dw, dh, fmt, halfType, filter);
      pres = mkDouble(gl, sw, sh, fmt, halfType, gl.NEAREST);
      div  = mkFBO   (gl, sw, sh, fmt, halfType, gl.NEAREST);
    }

    function blit(target) {
      if (target === null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.w, target.h);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // ── Simulation passes ──
    function advect(velFBO, src, dst, dt, diss) {
      const pg = advectProg;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform2f(pg.u.texelSize,    velFBO.r.tx, velFBO.r.ty);
      gl.uniform2f(pg.u.dyeTexelSize, src.r.tx,    src.r.ty);
      gl.uniform1i(pg.u.uVelocity, velFBO.r.bind(0));
      gl.uniform1i(pg.u.uSource,   src.r.bind(1));
      gl.uniform1f(pg.u.dt, dt);
      gl.uniform1f(pg.u.dissipation, diss);
      blit(dst.w); dst.swap();
    }

    function computeDiv() {
      const pg = divProg;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform2f(pg.u.texelSize, vel.r.tx, vel.r.ty);
      gl.uniform1i(pg.u.uVelocity, vel.r.bind(0));
      blit(div);
    }

    function solvePressure(iters) {
      const pg = presProg;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform2f(pg.u.texelSize, pres.r.tx, pres.r.ty);
      gl.uniform1i(pg.u.uDivergence, div.bind(0));
      for (let i = 0; i < iters; i++) {
        gl.uniform1i(pg.u.uPressure, pres.r.bind(1));
        blit(pres.w); pres.swap();
      }
    }

    function subtractGrad() {
      const pg = gradProg;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform2f(pg.u.texelSize, vel.r.tx, vel.r.ty);
      gl.uniform1i(pg.u.uPressure, pres.r.bind(0));
      gl.uniform1i(pg.u.uVelocity, vel.r.bind(1));
      blit(vel.w); vel.swap();
    }

    function applyViscous(iters) {
      const { viscous: v } = p.current;
      const alpha = (vel.r.tx * vel.r.tx) / (v * 0.001 * 16.666);
      const rBeta = 1.0 / (4.0 + alpha);
      const pg = viscProg;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform2f(pg.u.texelSize, vel.r.tx, vel.r.ty);
      gl.uniform1f(pg.u.alpha, alpha);
      gl.uniform1f(pg.u.rBeta, rBeta);
      for (let i = 0; i < iters; i++) {
        gl.uniform1i(pg.u.uVelocity, vel.r.bind(0));
        blit(vel.w); vel.swap();
      }
    }

    function splat(x, y, dx, dy, color, radius) {
      const pg = splatProg;
      const aspect = canvas.width / canvas.height;
      bindQuad(pg); gl.useProgram(pg.p);
      gl.uniform1f(pg.u.aspectRatio, aspect);
      gl.uniform2f(pg.u.point, x, y);
      gl.uniform1f(pg.u.radius, (radius / Math.min(canvas.width, canvas.height)) ** 2);

      gl.uniform1i(pg.u.uTarget, vel.r.bind(0));
      gl.uniform3f(pg.u.color, dx, dy, 0);
      blit(vel.w); vel.swap();

      gl.uniform1i(pg.u.uTarget, dye.r.bind(0));
      gl.uniform3f(pg.u.color, color.r, color.g, color.b);
      blit(dye.w); dye.swap();
    }

    // ── Resize ──
    function resize() {
      const w = wrap.clientWidth  || window.innerWidth;
      const h = wrap.clientHeight || window.innerHeight;
      // Also check !vel: React Strict Mode re-runs effect with same canvas dimensions,
      // so the width/height comparison would be equal and initFBOs would never be called.
      if (!vel || canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        initFBOs();
      }
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Pointer ──
    const ptr = { x:.5, y:.5, dx:0, dy:0, moved:false, ci:0 };

    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1 - (e.clientY - r.top) / r.height;
      // Multiply by 500 to bring UV-space deltas into the velocity scale the sim expects
      ptr.dx = (nx - ptr.x) * p.current.mouseForce * 500;
      ptr.dy = (ny - ptr.y) * p.current.mouseForce * 500;
      ptr.x = nx; ptr.y = ny; ptr.moved = true;
    }
    window.addEventListener("mousemove", onMove);

    // ── Auto-demo state ──
    const AUTO_PTS = [
      { x:.22, y:.50, dx: 450, dy: 90 },
      { x:.78, y:.50, dx:-450, dy:-90 },
      { x:.50, y:.22, dx: 90, dy: 450 },
      { x:.50, y:.78, dx:-90, dy:-450 },
      { x:.30, y:.30, dx: 360, dy: 360 },
      { x:.70, y:.70, dx:-360, dy:-360 },
    ];
    let autoTimer = 0, autoIdx = 0;

    // ── Main loop ──
    // Use -autoResumeDelay so auto-demo starts immediately without waiting
    let lastMouseT = -(p.current.autoResumeDelay + 1);
    let lastT = 0, animId;

    function loop(t) {
      animId = requestAnimationFrame(loop);
      if (!vel) return; // FBOs not ready (e.g. second Strict Mode mount before resize fires)
      const dt = Math.min((t - lastT) * 0.001, 0.016666);
      lastT = t;

      const props = p.current;

      // Mouse splat
      if (ptr.moved) {
        const col = hexRgb(props.cols[ptr.ci % 3]);
        splat(ptr.x, ptr.y, ptr.dx, ptr.dy, col, props.cursorSize);
        ptr.moved = false; ptr.ci++;
        lastMouseT = t;
      }

      // Auto-demo splats (only when no recent mouse)
      if (props.autoDemo && t - lastMouseT > props.autoResumeDelay) {
        autoTimer += dt * props.autoSpeed;
        if (autoTimer > 0.6 / props.autoIntensity) {
          autoTimer = 0;
          const ap = AUTO_PTS[autoIdx % AUTO_PTS.length];
          autoIdx++;
          const col = hexRgb(props.cols[autoIdx % 3]);
          const jx = (Math.random() - .5) * .25;
          const jy = (Math.random() - .5) * .25;
          splat(
            ap.x + jx, ap.y + jy,
            ap.dx * (.5 + Math.random()),
            ap.dy * (.5 + Math.random()),
            col,
            props.cursorSize * .7
          );
        }
      }

      // Simulation
      if (props.isViscous) applyViscous(props.iterationsViscous);
      advect(vel, vel, vel, dt, 0.998);
      advect(vel, dye, dye, dt, 0.982);
      computeDiv();
      solvePressure(props.iterationsPoisson);
      subtractGrad();

      // Render to screen (opaque white background)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const dp = displayProg;
      bindQuad(dp); gl.useProgram(dp.p);
      gl.uniform1i(dp.u.uTexture, dye.r.bind(0));
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      // Do NOT call loseContext() here — it permanently invalidates the canvas for the
      // duration of the page, breaking React Strict Mode's second mount and HMR remounts.
    };
  }, []); // eslint-disable-line

  return (
    <div ref={wrapRef} className="kks-liquid-ether">
      <canvas ref={canvasRef} className="kks-liquid-ether-canvas" />
    </div>
  );
}
