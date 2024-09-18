// 13-Shader 系列-马赛克特效
// https://juejin.cn/post/7370513151051530267

// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import snoise from './utils/snoise';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ccc"); // 设置场景背景颜色

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// 设置相机位置
// camera.position.set(0, 3, 30);
camera.position.set(0, 0, 1);
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

const path = "/avatar.jpg"

function loadImages(path, whenLoaded) {
    const img = new Image();//img标签
    img.crossOrigin = "Anonymous";
    img.onload = function () {
        whenLoaded(img);
    };
    img.src = path;

    return img;
}

const size = 100;
const canvas = document.createElement("canvas");
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext("2d");
// document.body.appendChild(canvas);
// canvas.classList.add("test-canvas");
// canvas.style.position = "fixed";
// canvas.style.top = 0;
// canvas.style.left = 0;

function getImageCoords(img) {
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;//ragb数组，length40000，与size*szie=10000，每个像素点有rgba四个值
    console.log('getImageData', data);
    const imageCoords = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            imageCoords.push([x / size - 0.5, 0.5 - y / size]);
        }
    }
    return imageCoords;
}

let geometry, material, points;
loadImages(path, function (img) {
    const imageCoords = getImageCoords(img);
    console.log('imageCoords', imageCoords);

    const row = 100; 
    const column = row;
    const count = row * column; // 10000
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    for (let j = 0; j < row; j++) {
        for (let i = 0; i < column; i++) {
            const x = i / column - 0.5; // -0.5-0.5
            const y = j / row - 0.5; // -0.5-0.5
            const u = x + 0.5; // 0-1
            const v = y + 0.5; // 0-1
            positions.set([x, y, 0], (i + j * column) * 3);
            uvs.set([u, v], (i + j * column) * 2);
        }
    }
    console.log('positions', positions);
    console.log('uvs', uvs);
    
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    const vertexShader = /* GLSL */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = 10.0 / -mvPosition.z;
    }`;

    const fragmentShader = /* GLSL */ `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    
    void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = color;
    }`;

    material = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {
                value: new THREE.TextureLoader().load(path),
            },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    points = new THREE.Points(geometry, material);
    scene.add(points);
});


// 渲染场景
function animate() {
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

