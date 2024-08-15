// 05-手把手带你入门 Three.js Shader 系列-基本（二）
// 作者：古柳 / 微信：xiaoaizhj 备注「可视化加群」欢迎进群交流
// 文章：「手把手带你入门 Three.js Shader 系列（二） - 牛衣古柳 - 20230716」
// 链接：https://mp.weixin.qq.com/s/EstTJxBt3AZAxsgaejJxhg
// 链接：https://juejin.cn/post/7256039179087380535
// Codepen：https://codepen.io/GuLiu/pen/oNOOLKa

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

  void main() {
    // 1. 纯红色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    // 2. vUv.x => 0.0-1.0 => 左边黑右边红
    gl_FragColor = vec4(vUv.x, 0.0, 0.0, 1.0);

    // 3. vUv.y => 0.0-1.0 => 下边黑上边红
    gl_FragColor = vec4(vUv.y, 0.0, 0.0, 1.0);
    
    // 4. 黑白灰
    gl_FragColor = vec4(vec3(vUv.x), 1.0);
    gl_FragColor = vec4(vec3(vUv.y), 1.0);
    
    // 5. 青红、蓝粉
    gl_FragColor = vec4(vUv, 0.0, 1.0);
    gl_FragColor = vec4(vUv, 1.0, 1.0);
    
    // 6. 颜色突变
    // float color = step(0.5, vUv.x);
    
    // float color = step(0.3, vUv.x);
    // float color = step(0.7, vUv.x);
    
    // 7. 黑白突变顺序互换
    // float color = step(0.5, 1.0 - vUv.x);
    // 两种方式都行
    // float color = step(vUv.x, 0.5);
    // gl_FragColor = vec4(vec3(color), 1.0);
    
    // // 8. 重复条纹效果
    gl_FragColor = vec4(vec3(fract(vUv.x * 3.0)), 1.0);
    gl_FragColor = vec4(vec3(step(0.5, fract(vUv.x * 3.0))), 1.0);
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

// let time = 0;
let clock = new THREE.Clock();
// 渲染场景
function animate() {
    // time += 0.05;
    // material.uniforms.uTime.value += time;
    let time = clock.getElapsedTime();
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








