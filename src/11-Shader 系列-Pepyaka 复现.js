// 11-手把手带你入门 Three.js Shader 系列-Pepyaka 复现
// https://mp.weixin.qq.com/s/ott654sdvBjF30aLlEcbIg

// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import snoise from './utils/snoise';

// 创建场景
const scene = new THREE.Scene();
// scene.background = new THREE.Color("#ccc"); // 设置场景背景颜色

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sphereGeometry = new THREE.SphereGeometry(1, 200, 200);

const vertexShader = /* GLSL */ `
  uniform float uTime;
  varying vec3 vColor;
  ${snoise}
  
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
      float noise = snoise(vec4(position*10.0, uTime * 0.2));
      vColor = hsv2rgb(vec3(noise * 0.1 + 0.04, 0.8, 1.0));
      vec3 newPos = position + 0.8 * normal * noise;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const fragmentShader = /* GLSL */ `
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

const sphereMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
  // wireframe: true,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 生成例子罩
let particleMaterial
const createParticle = () => {
  const particleGeometry = new THREE.BufferGeometry();

  const N = 6000;
  const positions = new Float32Array(N * 3);

  const inc = Math.PI * (3 - Math.sqrt(5));
  const off = 2 / N;
  const radius = 2;

  for (let i = 0; i < N; i++) {
    const y = i * off - 1 + off / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * inc;

    positions[3 * i] = radius * Math.cos(phi) * r;
    positions[3 * i + 1] = radius * y;
    positions[3 * i + 2] = radius * Math.sin(phi) * r;
  }

  // 另一种生成球体上均匀粒子坐标的方式
  // for (let i = 0; i < N; i++) {
  //   const k = i + 0.5;
  //   const phi = Math.acos(1 - (2 * k) / N);
  //   const theta = Math.PI * (1 + Math.sqrt(5)) * k;
  //   const x = Math.cos(theta) * Math.sin(phi) * radius;
  //   const y = Math.sin(theta) * Math.sin(phi) * radius;
  //   const z = Math.cos(phi) * radius;

  //   positions.set([x, y, z], i * 3);
  // }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particleVertex = /* GLSL */ `
    uniform float uTime;
  
    void main() {
      vec3 newPos = position;
      newPos.y += 0.1 * sin(newPos.y * 6.0 + uTime * 5.0);
      newPos.z += 0.05 * sin(newPos.y * 10.0 + uTime * 5.0);

      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
      gl_PointSize = 6.0 / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const particleFragment = /* GLSL */ `
    void main() {
      // gl_FragColor = vec4(vec3(1.0), 1.0);
      gl_FragColor = vec4(vec3(1.0), 0.6);
    }
  `;

  particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}
createParticle();

// 生成背景粒子
let firefliesMaterial
const createBack = () => {
  const firefliesGeometry = new THREE.BufferGeometry();
  const firefliesCount = 300;
  const positions1 = new Float32Array(firefliesCount * 3);
  const sizes = new Float32Array(firefliesCount);

  for (let i = 0; i < firefliesCount; i++) {
    const r = Math.random() * 5 + 5;
    positions1[i * 3 + 0] = (Math.random() - 0.5) * r;
    positions1[i * 3 + 1] = (Math.random() - 0.5) * r;
    positions1[i * 3 + 2] = (Math.random() - 0.5) * r;

    sizes[i] = Math.random() + 0.4;
  }

  firefliesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions1, 3)
  );
  firefliesGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const firefliesVertexShader = /* GLSL */ `
    uniform float uTime;
    attribute float aSize;

    void main() {
        vec3 newPos = position;
        newPos.y += sin(uTime * 0.5 + newPos.x * 100.0) * aSize * 0.2;
        newPos.x += sin(uTime * 0.5 + newPos.x * 200.0) * aSize * 0.1;
        vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
        gl_PointSize = 70.0 * aSize / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
  `;

  const firefliesFragmentShader = /* GLSL */ `
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      float strength = clamp(0.05 / d - 0.05 * 2.0, 0.0, 1.0);
      gl_FragColor = vec4(vec3(1.0), strength);
    }
  `;

  firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
  scene.add(fireflies);
}
createBack()

// 生成文字
let textMaterial
const createText = () => {
  const textGeometry = new THREE.PlaneGeometry(2, 1, 100, 100);

  const textVertex = /* GLSL */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 newPos = position;
    newPos.y += 0.06 * sin(newPos.x + uTime);
    newPos.x += 0.1 * sin(newPos.x * 2.0 + uTime);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

  const textFragment = /* GLSL */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
  }
`;

  textMaterial = new THREE.ShaderMaterial({
    vertexShader: textVertex,
    fragmentShader: textFragment,
    uniforms: {
      uTime: { value: 0 },
      uTexture: {
        value: new THREE.TextureLoader().load("/text.png"), // './assets/text.png','https://i.postimg.cc/nrSTmrZk/text.png',
      },
    },
    transparent: true,
  });

  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.position.z = 1.7;
  scene.add(text);
}
createText()
// 设置相机位置
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;

// 渲染场景
let clock = new THREE.Clock();
function animate() {
  let time = clock.getElapsedTime();
  sphereMaterial.uniforms.uTime.value = time;
  particleMaterial.uniforms.uTime.value = time;
  firefliesMaterial.uniforms.uTime.value = time;
  textMaterial.uniforms.uTime.value = time;

  renderer.render(scene, camera);
  controls.update()
  requestAnimationFrame(animate);
}

animate();

// 监听窗口变化
window.addEventListener('resize', function () {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机的投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
})

// 创建GUI
const gui = new GUI();
// gui.add(material, 'wireframe').name('线框模式')

// gui
//   .add(material.uniforms.uStrength, "value", 0, 1, 0.01)
//   .name("uStrength");

// gui
//   .add(material.uniforms.uFrequency, "value", 0, 20, 0.01)
//   .name("uFrequency");
