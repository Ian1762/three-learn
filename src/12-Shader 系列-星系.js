// 12-Shader 系列-星系
// https://juejin.cn/post/7358704808525971475?searchId=20240808094337E223662DD7C0C43D43C8

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
// 设置相机位置
camera.position.set(0, 3, 30);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;

// ====================
// 1. mesh
// const geometry = new THREE.SphereGeometry(10);
// const material = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   wireframe: true,
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
// ====================

// ====================
// 2. 点物体
// const geometry = new THREE.SphereGeometry(10,32,32);
// const material = new THREE.PointsMaterial({
//   size: 0.4,
//   color: 0xffffff,
// });

// const points = new THREE.Points(geometry, material);
// scene.add(points);
// ====================

// ====================
const count1 = 50000;
const count2 = 100000;
const geometry = new THREE.BufferGeometry();
const positions = [];
const sizes = [];
const shifts = [];
for (let i = 0; i < count1 + count2; i++) {
  // 球体部分
  if (i < count1) {
    let { x, y, z } = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(Math.random() * 0.5 + 9.5);
    positions.push(x, y, z);

    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(Math.random() * 2 - 1);// -1-1
    let angle = (Math.random() * 0.9 + 0.1) * Math.PI * 0.1;// (0.1-1)*0.1*PI
    let strength = Math.random() * 0.9 + 0.1; // 0.1-1
    shifts.push(theta, phi, angle, strength);
  } else {
    // 圆盘/圆柱部分
    // 圆盘粒子
    let r = 10;
    let R = 40;
    let rand = Math.pow(Math.random(), 1.5);
    let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
    let { x, y, z } = new THREE.Vector3().setFromCylindricalCoords(
      radius,
      Math.random() * 2 * Math.PI,
      (Math.random() - 0.5) * 2
    );
    positions.push(x, y, z);
  }

  let size = Math.random() * 1.5 + 0.5; // 0.5-2.0
  sizes.push(size);
}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
geometry.setAttribute("aShift", new THREE.Float32BufferAttribute(shifts, 4));

const vertexShader = /* GLSL */ `
  attribute float aSize;
  attribute vec4 aShift;
  uniform float uTime;
  varying vec3 vColor;

  const float PI = 3.1415925;
  void main() {
    // rgb(227, 155, 0) #E39B00
    // rgb(100, 50, 255) #6432FF
    vec3 color1 = vec3(227., 155., 0.);
    vec3 color2 = vec3(100., 50., 255.);

    float d = length(abs(position) / vec3(40., 10., 40.));
    d = clamp(d, 0., 1.);
    vColor = mix(color1, color2, d) / 255.;
    
    vec3 transformed = position;
    float theta = mod(aShift.x + aShift.z * uTime, PI * 2.);
    float phi = mod(aShift.y + aShift.z * uTime, PI * 2.);
    transformed += vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * aShift.w;

    // vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    // gl_PointSize = 15.0;
    // 3.粒子近大远小
    gl_PointSize = aSize * 100.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* GLSL */ `
varying vec3 vColor;

  void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.1, d));
  }
`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  // 设置为true表示这个材料是透明的。这会影响渲染顺序和深度测试（如果启用了深度测试的话）。
  transparent: true,
  /**
   * 设置为THREE.AdditiveBlending表示使用加性混合模式来渲染这个材料。
   * 加性混合会将当前像素的颜色值与其背后像素的颜色值相加，然后可能通过某些操作（如钳制到颜色值范围）来得到最终的颜色。
   * 这常用于创建发光或光晕效果
   * 设置 blending 为 THREE.AdditiveBlending 这样粒子重叠后的颜色会变白发亮，可以看到球体边缘一圈微微发亮。
   */
  blending: THREE.AdditiveBlending,
  /**
   * 设置为false表示禁用深度测试。深度测试是渲染过程中用于确定哪些物体应该被渲染在前面，哪些应该被遮挡的技术。
   * 禁用它可能会导致渲染的物体不按预期的顺序出现，但在某些特定的视觉效果（如全屏效果或某些类型的后期处理）中可能是必要的
   * depthTest 为 false 以避免粒子黑边的效果，最终放大后的粒子效果如右图所示，圆圈朦胧、重叠变白发亮。
   */
  depthTest: false,
});
const points = new THREE.Points(geometry, material);
points.rotation.order = "ZYX";
points.rotation.z = 0.2;
scene.add(points);
// ====================

// 渲染场景
let clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime() * 0.5;
  // mesh.rotation.y = time;
  // points.rotation.y = time;
  material.uniforms.uTime.value = time;
  points.rotation.y = time * 0.05;

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
