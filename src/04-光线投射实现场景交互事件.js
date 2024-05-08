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

// 创建三个球体
const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })

);
sphere1.position.x = -4
scene.add(sphere1);

const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })

);
sphere2.position.x = 0
scene.add(sphere2);

const sphere3 = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })

);
sphere3.position.x = 4
scene.add(sphere3);

// 创建射线
const raycaster = new THREE.Raycaster();

// 创建鼠标向量
const mouse = new THREE.Vector2();

// 监听鼠标移动事件
document.addEventListener('click', function (event) {
    console.log(event.clientX, event.clientY, window.innerWidth, window.innerHeight)
    // 计算鼠标在屏幕上的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, camera);

    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects([sphere1, sphere2, sphere3]);
    console.log('intersects', intersects)

    // 遍历交点
    if (intersects.length > 0) {
        if (intersects[0].object._isSelected) {
            intersects[0].object.material.color.set(intersects[0].object._orginColor);
            intersects[0].object._isSelected = false;
            return
        }
        intersects[0].object._isSelected = true;
        intersects[0].object._orginColor = intersects[0].object.material.color.getHex();
        intersects[0].object.material.color.set(0xffffff);

    }
})




// 设置相机位置
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 15;
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

