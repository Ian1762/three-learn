// 10-手把手带你入门 Three.js Shader 系列-爆炸球颜色变化（七）

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
  uniform float uStrength;
  uniform float uFrequency;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vNoise;

  ${noise}
  ${random}

  void main() {
    vUv = uv;
    vec3 newPos = position;
    float noise = cnoise(position * uFrequency + uTime);

    newPos += normal * noise * uStrength;
    vNoise = noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

    vNormal = normal;
  }
`;

// 片元着色器***********************
const fragmentShader = /* GLSL */ `
    varying vec2 vUv;
    uniform float uTime;
    varying vec3 vNormal;
    varying float vNoise;

    float hue2rgb(float f1, float f2, float hue) {
        if (hue < 0.0)
            hue += 1.0;
        else if (hue > 1.0)
            hue -= 1.0;
        float res;
        if ((6.0 * hue) < 1.0)
            res = f1 + (f2 - f1) * 6.0 * hue;
        else if ((2.0 * hue) < 1.0)
            res = f2;
        else if ((3.0 * hue) < 2.0)
            res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
        else
            res = f1;
        return res;
    }

    vec3 hsl2rgb(float h, float s, float l) {
        vec3 hsl = vec3(h, s, l);
        vec3 rgb;

        if (hsl.y == 0.0) {
            rgb = vec3(hsl.z); // Luminance
        } else {
            float f2;

            if (hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
            else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;

            float f1 = 2.0 * hsl.z - f2;

            rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
            rgb.g = hue2rgb(f1, f2, hsl.x);
            rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
        }   
        return rgb;
    }

    void main() {
      // 单色
      // vec3 color = hsl2rgb(0.0, 1.0, 0.5);
      // 单色变色
      // vec3 color = hsl2rgb(fract(uTime * 0.1), 1.0, 0.5);
      // 将 noise 数值作为 hue 色相值
      // vec3 color = hsl2rgb(vNoise, 1.0, 0.5);
      // 使用hue改变颜色，noise数值丰富它
      // vec3 color = hsl2rgb(0.1 + vNoise * 0.1, 1.0, 0.5);
      // noise作为颜色，同时改变它
      vec3 color = hsl2rgb(fract(uTime * 0.1 + vNoise * 0.1), 1.0, 0.5);
      gl_FragColor = vec4(color, 1.0);
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
    uStrength: { value: 0.5 },
    uFrequency: { value: 5.0 },
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

gui
  .add(material.uniforms.uStrength, "value", 0, 1, 0.01)
  .name("uStrength");

gui
  .add(material.uniforms.uFrequency, "value", 0, 20, 0.01)
  .name("uFrequency");





