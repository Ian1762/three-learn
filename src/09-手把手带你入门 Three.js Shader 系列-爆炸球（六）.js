// 09-手把手带你入门 Three.js Shader 系列-爆炸球（六）

// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import noise from './utils/noise';
import random from './utils/random';
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ccc"); // 设置场景背景颜色

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 顶点着色器***********************
const vertexShader = /* GLSL */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  ${noise}
  ${random}

  void main() {
    vUv = uv;
    vec3 newPos = position;
    // 1、顶点 y 坐标累加 sin 值----形状类似纺锤体
    // newPos.y += sin(position.y);
    ///2、借助 sin 函数来将 uTime 变化到0.0到10.0再去改变y的值
    // newPos.y += sin(position.y * (sin(uTime) + 1.0) * 5.0);
    // 3、固定下数值，将 uTime 加到后面
    // newPos.y += sin(position.y * 1.0 + uTime * 2.0);
    ///4、noise 噪声函数
    // newPos += cnoise(position);
    ///5、noise 噪声函数----每个顶点朝自己原本的方向去偏移
    // newPos += normal * cnoise(position);
    ///6、random与噪声的区别
    // newPos += normal * random(position);
    ///7、noise 改变 position 相邻范围
    // newPos += normal * cnoise(position * 5.0);
    ///8、动态调整数值
    newPos += normal * cnoise(position * (sin(uTime * 0.3) + 1.0) * 4.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    vNormal = normal;
  }
`;

// 片元着色器***********************
const fragmentShader = /* GLSL */ `
    varying vec2 vUv;
    uniform float uTime;
    varying vec3 vNormal;

    void main() {
      gl_FragColor = vec4(vNormal, 1.0);
    }
`;

// 创建几何体
// const geometry = new THREE.PlaneGeometry(1, 1);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1);
// const geometry = new THREE.SphereGeometry(1, 32, 16);
// const geometry = new THREE.SphereGeometry(1, 64, 64);
// const geometry = new THREE.SphereGeometry(1, 128, 128);
const geometry = new THREE.SphereGeometry(1, 256, 256);

const material = new THREE.ShaderMaterial({
  //可在外部通过 material.uniforms.uTime.value 访问
  // 着色器内部声明 uniform float uTime; 使用
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 设置相机位置
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;

// 渲染场景
let time = 0;
function animate() {
  time += 0.05;
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
gui.add(material, 'wireframe').name('线框模式')







