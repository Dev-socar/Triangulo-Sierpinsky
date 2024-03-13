// Programa de sombreador de vértices
const vsSource = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

// Programa de sombreador de fragmentos
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      gl_FragColor = uColor;
    }
  `;

function initShaderProgram(gl, vsSource, fsSource) {
  // Compila los shaders de vértices y fragmentos, crea el programa de sombreado y enlaza los shaders al programa
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Verifica si la inicialización del programa de sombreado fue exitosa
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "No se pudo inicializar el programa de sombreado: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  // Compila el sombreador del tipo especificado y lo devuelve
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Verifica si la compilación del sombreador fue exitosa
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Ocurrió un error al compilar los sombreadores: " +
        gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function drawTriangle(gl, programInfo, x1, y1, x2, y2, x3, y3, depth, colors) {
  // Dibuja un triángulo o lo divide recursivamente en subtriángulos y los dibuja

  if (depth === 0) {
    // Dibuja el triángulo
    const vertices = [x1, y1, x2, y2, x3, y3];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Selecciona el color
    const color = colors[Math.floor(Math.random() * colors.length)];
    const colorUniformLocation = gl.getUniformLocation(
      programInfo.program,
      "uColor"
    );
    gl.uniform4fv(colorUniformLocation, color);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    // Calcula los puntos medios de los lados
    const midX1 = (x1 + x2) / 2;
    const midY1 = (y1 + y2) / 2;
    const midX2 = (x2 + x3) / 2;
    const midY2 = (y2 + y3) / 2;
    const midX3 = (x1 + x3) / 2;
    const midY3 = (y1 + y3) / 2;

    // Dibuja recursivamente los tres subtriángulos
    drawTriangle(
      gl,
      programInfo,
      x1,
      y1,
      midX1,
      midY1,
      midX3,
      midY3,
      depth - 1,
      colors
    );
    drawTriangle(
      gl,
      programInfo,
      midX1,
      midY1,
      x2,
      y2,
      midX2,
      midY2,
      depth - 1,
      colors
    );
    drawTriangle(
      gl,
      programInfo,
      midX3,
      midY3,
      midX2,
      midY2,
      x3,
      y3,
      depth - 1,
      colors
    );
  }
}

function draw() {
  // Inicializa el contexto WebGL
  const canvas = document.querySelector("#lienzo");
  const gl = canvas.getContext("webgl");

  // Verifica si WebGL es soportado
  if (!gl) {
    console.error("WebGL no soportado");
    return;
  }

  // Inicializa el programa de sombreado y la información del programa
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aPosition"),
    },
  };

  // Limpia el lienzo
  gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(programInfo.program);

  // Define los vértices del triángulo inicial
  const x1 = -1.0;
  const y1 = -1.0;
  const x2 = 0.0;
  const y2 = 1.0;
  const x3 = 1.0;
  const y3 = -1.0;

  // Define la profundidad de la recursión
  const depth = 2;

  // Define los colores
  const colors = [
    [1.0, 0.0, 0.0, 1.0], // Rojo
    [0.0, 1.0, 0.0, 1.0], // Verde
    [0.0, 0.0, 1.0, 1.0], // Azul
  ];

  // Dibuja el triángulo de Sierpinski
  drawTriangle(gl, programInfo, x1, y1, x2, y2, x3, y3, depth, colors);
}

draw();
