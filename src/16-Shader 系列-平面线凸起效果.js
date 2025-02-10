// 16-Shader 系列-平面线凸起效果
// https://juejin.cn/post/7358704808525971475?searchId=20240808094337E223662DD7C0C43D43C8

// 导入threejs
import * as THREE from 'three';
// 导入gsap
import gsap from "gsap";
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import rgb2hsl from './utils/rgb2hsl';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ccc"); // 设置场景背景颜色

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// 设置相机位置
camera.position.set(0, 0, 1.4);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;

const vertexShader = /* GLSL */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vStrength;

  const float PI = 3.141592653589793238;

  void main() {
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // 斜向变化
    // float strength = uv.x;
    // 渐变斜向变化
    // float strength = smoothstep(0.0, 1.0, uv.x);
    // float strength = smoothstep(0.2, 0.8, uv.x);
    // float strength = smoothstep(0.8, 0.2, uv.x);
    // 凸起效果
    // float strength = abs(uv.x - 0.5);
    // 渐变凸起效果
    // float strength = smoothstep(0.0, 0.5, abs(uv.x - 0.5));
    // float strength = smoothstep(0.5, 0.0, abs(uv.x - 0.5));
    // float strength = smoothstep(0.3, 0.0, abs(uv.x - 0.5));
    // 动画渐变凸起效果
    float strength = smoothstep(0.3, 0.0, abs(uv.x - 0.5 + 0.5 * sin(uTime)));

    vStrength = strength;
    // 凸起效果
    modelPosition.z += 0.3 * strength;
    // 视图矩阵计算
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const fragmentShader = /* GLSL */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying float vStrength;

  void main() {
    // 纯色
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    // 黑白渐变
    vec3 color = vec3(vStrength);
    gl_FragColor = vec4(color, 1.0);
    // 旗帜贴图
    // gl_FragColor = texture2D(uTexture, vUv);
  }
`;

// const geometry = new THREE.PlaneGeometry(1, 1, 30, 30);
const geometry = new THREE.PlaneGeometry(0.8, 0.534, 30, 30);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: {
      value: new THREE.TextureLoader().load("/public/Flag-Spain.webp"),
    },
  },
  vertexShader,
  fragmentShader,
  // wireframe: true,
  side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);
// mesh.rotation.x = -Math.PI / 2;
scene.add(mesh);


// 渲染场景
const clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime();
  material.uniforms.uTime.value = time;

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



