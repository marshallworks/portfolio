const SHADER = document.getElementById('shader').text;
const CANVAS = document.querySelector('canvas');
const CTX = CANVAS.getContext('webgpu');
let WIDTH = CANVAS.parentElement.clientWidth;
let HEIGHT = CANVAS.parentElement.clientHeight;
CANVAS.width = WIDTH;
CANVAS.height = HEIGHT;
CANVAS.style.width = `${WIDTH}px`;
CANVAS.style.height = `${HEIGHT}px`;

async function initWebGPU() {
  let mouseX = 0;
  let mouseY = 0;

  CANVAS.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  if (!navigator.gpu) {
    console.error('WebGPU not supported.');
    return;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error('Unable to request a WebGPU adapter.');
    return;
  }
  const device = await adapter.requestDevice();

  const shaderModule = device.createShaderModule({
    code: SHADER
  });

  CTX.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied'
  });
  const vertices = new Float32Array([
    -1, 1, 0, 1,
    0, 1,

    -1, -1, 0, 1,
    0, 0,

    1, 1, 0, 1,
    1, 1,

    1, 1, 0, 1,
    1, 1,

    -1, -1, 0, 1,
    0, 0,

    1, -1, 0, 1,
    1, 0,
  ]);
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);
  const vertexBuffers = [
    {
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x4' },
        { shaderLocation: 1, offset: 16, format: 'float32x2' },
      ],
      arrayStride: 24,
      stepMode: 'vertex'
    }
  ];
  const uniformBufferSize =
    2 * 4 + // time
    2 * 4 + // mouse
    2 * 4 + // resolution
    4 * 4 + // light 0 pos
    4 * 4 + // light 0 color
    4 * 4 + // light 1 pos
    4 * 4 * // light 1 color
    4 * 4 * // ambient
    4 * 4;  // background
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  const uniformValues = new Float32Array(uniformBufferSize / 4);
  uniformValues.set([0, 0], 0);
  uniformValues.set([mouseX, mouseY], 2);
  uniformValues.set([WIDTH, HEIGHT], 4);
  uniformValues.set([-0.5, 0.4, -0.6, 1.0], 6);
  uniformValues.set([1, 1, 0.95, 1], 10);
  uniformValues.set([40.0, 20.0, 20.0, 1.0], 14);
  uniformValues.set([0.7, 0.75, 0.88, 1], 18);
  uniformValues.set([0.2, 0.2, 0.2, 1], 22);
  uniformValues.set([0.7, 0.7, 0.7, 1], 26);
  const pipelineDescriptor = {
    vertex: {
      module: shaderModule,
      entryPoint: 'vertex_main',
      buffers: vertexBuffers
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragment_main',
      targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
    },
    primitive: { topology: 'triangle-list' },
    layout: 'auto'
  };
  const renderPipeline = device.createRenderPipeline(pipelineDescriptor);
  const bindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const draw = (time) => {
    uniformValues.set([time / 1000, time / 1000, mouseX, mouseY], 0);

    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
    const commandEncoder = device.createCommandEncoder();
    const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

    const renderPassDescriptor = {
      colorAttachments: [
        {
          clearValue: clearColor,
          loadOp: 'clear',
          storeOp: 'store',
          view: CTX.getCurrentTexture().createView(),
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(renderPipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(6);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    window.requestAnimationFrame(draw);
  };

  draw();
}

initWebGPU();

