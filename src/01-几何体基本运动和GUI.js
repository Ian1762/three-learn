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

// 创建立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 材质
const parentMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// 设置材质为线框模式
parentMaterial.wireframe = true;

// 创建网格
const parentCube = new THREE.Mesh(geometry, parentMaterial);
const cube = new THREE.Mesh(geometry, material);
parentCube.add(cube);

parentCube.position.set(-3, 0, 0)
// parentCube.scale.set(2, 2, 2)
parentCube.rotation.set(Math.PI / 4, 0, 0)

// cube.position.x = 2;
cube.position.set(3, 0, 0)
// cube.scale.set(1.5, 1.5, 1.5)
cube.rotation.set(Math.PI / 4, 0, 0)

// 将几何体添加到场景中
scene.add(parentCube);

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

const eventObj = {
    Fullscreen: function () {
        document.body.requestFullscreen();
    },
    ExitFullscreen: function () {
        document.exitFullscreen();
    }
}

// 创建GUI
const gui = new GUI();
// 添加按钮
gui.add(eventObj, 'Fullscreen').name('全屏')
gui.add(eventObj, 'ExitFullscreen').name('退出全屏')
// 控制立方体的位置
const folder = gui.addFolder('立方体位置')
// gui.add(cube.position, 'x', -5, 5).step(1).name('x轴位置')
folder.add(cube.position, 'x').min(-10).max(10).step(1).name('x轴位置').onChange(function (value) {
    console.log('位置', value)
})
folder.add(cube.position, 'y').min(-10).max(10).step(1).name('y轴位置').onFinishChange(function (value) {
    console.log('结束', value)
})
folder.add(cube.position, 'z').min(-10).max(10).step(1).name('z轴位置')

gui.add(parentMaterial, 'wireframe').name('父元素线框模式')

const colorParams = {
    cubeColor: '#00ff00',
}
gui.addColor(colorParams, 'cubeColor').name('立方体颜色').onChange(function (value) {
    cube.material.color.set(value)
})