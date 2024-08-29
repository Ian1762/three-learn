// 07-手把手带你入门 Three.js Shader 系列-mix 线性插值（四）
// 作者：古柳 / 微信：xiaoaizhj 备注「可视化加群」欢迎进群交流
// 文章：「手把手带你入门 Three.js Shader 系列（四） - 牛衣古柳 - 20231121」
// 链接：https://mp.weixin.qq.com/s/BYIB6MoHCChL6M0XdBFkJQ
// 链接：https://juejin.cn/post/7303797715393183796

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
/**
 * mix(x, y, a) 为线性插值，结果为 x*(1-a)+y*a，浮点数 a 的范围是0.0到1.0，根据其数值大小对 x、y 进行插值。当 a=0.0 时，mix 的结果为 x；a=1.0 时，
 * 结果为 y；a=0.5 时，结果为 (x+y)/2.0 ... 其中 x、y 可以是 float/vec2/vec3/vec4 等数据类型，只要两者类型一致就行，插值后的结果也是同一类型。
 */
const fragmentShader = /* GLSL */ `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vec3 color1 = vec3(1.0, 1.0, 0.0);
      vec3 color2 = vec3(0.0, 1.0, 1.0); 

      float mixer1 = vUv.x + vUv.y;
      mixer1 = clamp(mixer1, 0.0, 1.0);
      float mixer2 = 2.0 - (vUv.x + vUv.y);
      mixer2 = clamp(mixer2, 0.0, 1.0);
      float mixer = mixer1 * mixer2;

      // vec3 color = vec3(mixer);
      vec3 color = mix(color1, color2, mixer);
      gl_FragColor = vec4(color, 1.0);
    }
`;

// 创建几何体
const geometry = new THREE.PlaneGeometry(1, 1);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const geometry = new THREE.SphereGeometry(1, 32, 16);
// const geometry = new THREE.ConeGeometry(1, 2, 16, 1);

const material = new THREE.ShaderMaterial({
  //可在外部通过 material.uniforms.uTime.value 访问
  // 着色器内部声明 uniform float uTime; 使用
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








