import vertProgram from "./main.vert";
import fragProgram from "./main.frag";
import * as twgl from "twgl.js";
import { scaleToBottomLeft } from "./utils";

type ShaderType = WebGLRenderingContext["VERTEX_SHADER"] | WebGLRenderingContext["FRAGMENT_SHADER"];

function createShader(gl: WebGLRenderingContext, type: ShaderType, source: string)
  : WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader)
    return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      `Could not compile WebGL shader.

      ${gl.getShaderInfoLog(shader)}
      `);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertShader: WebGLShader, fragShader: WebGLShader)
  : WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      `Could not compile WebGL program.
    
      ${gl.getProgramInfoLog(program)}
      `);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function main(): void {
  // --- PREPARE --- //

  const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
  if (!canvas) {
    console.error(
      `Unable to get the canvas element. Either your HTML broke or the dev being stupid.
      Report this to the dev ASAP.
      `);
    return;
  }

  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error(
      `Unable to load WebGL context from canvas. Perhaps your browser doesn't support it. Stopping.
      `);
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertProgram);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragProgram);
  if (!vertexShader || !fragmentShader) {
    console.error("Unable to compile shaders. Stopping.");
    return;
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    console.error("Unable to create WebGLProgram. Stopping.");
    return;
  }
  gl.useProgram(program);

  // --- THE REAL WORK --- //

  // position

  const posBuffer = gl.createBuffer()!!;

  const pos = new Float32Array([
    4 / 8, 4 / 8,
    1 / 8, 4 / 8,
    4 / 8, 1 / 8,

    4 / 8, 7 / 8,
    4 / 8, 4 / 8,
    7 / 8, 4 / 8,

    4 / 8, 4 / 8,
    7 / 8, 4 / 8,
    4 / 8, 1 / 8,
  ]).map(scaleToBottomLeft);


  // color

  const colBuffer = gl.createBuffer()!!;

  const stellaColors = [
    196, 92, 255, 255,
    115, 92, 255, 255,
    92, 151, 255, 255,
  ];

  const revalxColors = [
    247, 135, 2, 255,
    236, 247, 2, 255,
    247, 13, 2, 255,
  ];

  const neoColors = [
    36, 247, 150, 255,
    36, 238, 247, 255,
    36, 133, 247, 255,
  ];

  const colors = new Uint8Array( (stellaColors)
                          .concat(revalxColors)
                          .concat(neoColors)
                 );

  // --- RENDERING --- //

  // prepare for rendering

  const resized = twgl.resizeCanvasToDisplaySize(canvas as HTMLCanvasElement, window.devicePixelRatio);
  console.log(`Canvas ${resized ? 'was' : 'already'} resized to ${canvas.width}x${canvas.height}.`);
  gl.viewport(0, 0, canvas.width, canvas.height);

  // render loop


  function render(gl: WebGLRenderingContext, program: WebGLProgram) {
    let time : number = 0;

    return function() {
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // set positions
      const attrPosPtr = gl.getAttribLocation(program, "a_Pos");
      gl.enableVertexAttribArray(attrPosPtr);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
      gl.vertexAttribPointer(attrPosPtr, 2, gl.FLOAT, false, 0, 0);

      // set colors
      const attrColPtr = gl.getAttribLocation(program, "a_Col");
      gl.enableVertexAttribArray(attrColPtr);
      gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(attrColPtr, 4, gl.UNSIGNED_BYTE, true, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, pos.length / 2);
    }
  }
  
  requestAnimationFrame(render(gl, program));

  console.log('done');

}

main()
