// 03-顶点组设置不同材质
// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建几何体
const geometry = new THREE.BufferGeometry();
// 1.使用顶点直接绘制 - 这种方式有6个点，有两个点重复了=============
// 创建定点数据 定点是有顺序的，逆时针为正面
// const vertices = new Float32Array([
//     -1, -1, 0, 1, -1, 0, 1, 1, 0,
//     1, 1, 0, -1, 1, 0, -1, -1, 0
// ])
// // 创建顶点属性
// geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
// ==============

// 2.使用索引绘 - 这种方式有4个点，有两个点重复使用===========
// 使用索引绘
const vertices = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0,
    -1, 1, 0
])
// 创建顶点属性
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
// 创建索引
const indices = new Uint16Array([
    0, 1, 2, 2, 3, 0
])
// 创建索引属性
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
// ================


// 设置2个定点组，形成两个材质
geometry.addGroup(0, 3, 0);
geometry.addGroup(3, 3, 1);

// 创建材质
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,

});
const material1 = new THREE.MeshBasicMaterial({
    color: 0xff0000,
})
// 创建网格
const plane = new THREE.Mesh(geometry, [material, material1]);
// 将几何体添加到场景中
scene.add(plane);

// 创建立方体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
// 材质
const cubeMaterial0 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cubeMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cubeMaterial3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cubeMaterial4 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const cubeMaterial5 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
// 创建网格
const cube = new THREE.Mesh(cubeGeometry, [cubeMaterial0, cubeMaterial1, cubeMaterial2, cubeMaterial3, cubeMaterial4, cubeMaterial5]);
cube.position.x = 2;
scene.add(cube);

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
function animate() {
    controls.update()
    requestAnimationFrame(animate);

    // 旋转立方体
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
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

