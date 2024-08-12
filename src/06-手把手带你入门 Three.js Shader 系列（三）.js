// 06-手把手带你入门 Three.js Shader 系列（三）
// 作者：古柳 / 微信：xiaoaizhj 备注「可视化加群」欢迎进群交流
// 文章：「手把手带你入门 Three.js Shader 系列（三） - 牛衣古柳 - 20230725」
// 链接：https://mp.weixin.qq.com/s/ifQxPHbWMoLVUTKOKKz_Lw
// 链接：https://juejin.cn/post/7259411780375314490
// Codepen：https://codepen.io/GuLiu/pen/yLrraVo

// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

  void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 片元着色器***********************
const fragmentShader = /* GLSL */ `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      // 绘制点点-渐变圆形
    //   float dist = length(fract(vUv * 5.0) - vec2(0.5));
    //   // 半径大小随时间周期变化
    //   float radius = 0.5 * (sin(uTime + vUv.x + vUv.y) * 0.5 + 0.5);
    //   vec3 color = vec3(step(radius, dist));
    //   gl_FragColor = vec4(color, 1.0);

      // 绘制环装-渐变圆形
    //   反向
    //   float dist = fract((length(vUv - vec2(0.5)) /0.707 + uTime * 0.1) * 5.0);
      float dist = fract((length(vUv - vec2(0.5)) /0.707 - uTime * 0.1) * 5.0);
      // 半径大小随时间周期变化
      float radius = 0.5;
      vec3 color = vec3(step(radius, dist));
      gl_FragColor = vec4(color, 1.0);
    }
`;

// 创建几何体
const geometry = new THREE.PlaneGeometry(1, 1);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const geometry = new THREE.SphereGeometry(1, 32, 16);
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1);

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    // wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 设置相机位置
camera.position.x = 2;
camera.position.y = 2;
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








