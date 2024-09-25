// 14-Shader 系列-粒子特效-下
// https://juejin.cn/post/7358704808525971475?searchId=20240808094337E223662DD7C0C43D43C8

// 导入threejs
import * as THREE from 'three';
// 导入gsap
import gsap from "gsap";
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import rgb2hsl from './utils/rgb2hsl';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ccc"); // 设置场景背景颜色

// 创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// 设置相机位置
camera.position.set(3, 3, 5);
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

const paths = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDE5MjAiPgogICAgPHN0eWxlPgogICAgICAgIC5zdDB7ZmlsbDojZmZmfS5zdDF7ZmlsbDpub25lO3N0cm9rZTojMjMxZjIwO3N0cm9rZS13aWR0aDo1MDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTB9CiAgICA8L3N0eWxlPgogICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTE3MDMuMSAxMzk2LjF2MTE2bC0yMjIuMi0xMjkuNUMxMzk0IDE0ODkuMiAxMTcxIDE2NTEuOCA5MjUgMTY1MS44Yy0xNDEuMiAwLTI1Ni41LTI0LjctMzQ5LjMtNjAuMmwuMy0uOHMxODUuMS0xMzUuNyAxODUuMS0zODcuNS0xODUuMi0zNjAuNy0xODUuMi0zNjAuN2MxNC41LTYgMjkuNS0xMS42IDQ1LTE2LjcgNTQuNi0xOCAxMTUuMi0yOS45IDE4Mi4xLTMyLjcgMTAuMS0uNCAyMC4zLS42IDMwLjctLjZsMjczLjctMTU5LjJ2MTkzLjJzMjgyLjcgOTYuMiAzODQuNiAyNzMuMWwyMTEuMS0xNTUuOHY0NTIuMnoiIGlkPSJMYXllcl8yIi8+CiAgICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNTc1LjkgODQyLjZTNzYxIDk1MS41IDc2MSAxMjAzLjNzLTE4NS4xIDM4Ny41LTE4NS4xIDM4Ny41bC0uMy44QzMzNi4yIDE0OTkuOSAyNDYgMTMzNS45IDI0NiAxMzM1LjlsMTA4LjItNDkuNy0xMzcuMy0xMDkuNGMwIC4xIDEwNy45LTIzMC4xIDM1OS0zMzQuMnptLTY3LjMgMjU5YzAtMjQuOC0yMC4xLTQ1LTQ1LTQ1cy00NSAyMC4xLTQ1IDQ1YzAgMjQuOCAyMC4xIDQ1IDQ1IDQ1czQ1LTIwLjIgNDUtNDV6IiBpZD0iTGF5ZXJfMyIvPgogICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTM3NS4yIDI2OC4xYzU1LjcgMCAxMDAuOSA0NS4yIDEwMC45IDEwMC45UzQzMSA0NjkuOSAzNzUuMiA0NjkuOSAyNzQuNCA0MjQuNyAyNzQuNCAzNjlzNDUuMS0xMDAuOSAxMDAuOC0xMDAuOXptMzE0LjUgMjc3LjNDNjA3LjUgNTQ1LjQgNTQxIDYxMS45IDU0MSA2OTRjMCA1Ny4zIDMyLjQgMTA3IDc5LjkgMTMxLjkgNTQuNi0xOCAxMTUuMi0yOS45IDE4Mi4xLTMyLjdsLS4xLTIuOGMyMi4xLTI2IDM1LjUtNTkuNiAzNS41LTk2LjQtLjEtODIuMS02Ni42LTE0OC42LTE0OC43LTE0OC42em0tNDcyLjggMTk4YzAgMzguOSAzMS42IDcwLjUgNzAuNSA3MC41czcwLjUtMzEuNiA3MC41LTcwLjVjMC0zOS0zMS42LTcwLjUtNzAuNS03MC41cy03MC41IDMxLjUtNzAuNSA3MC41eiIgaWQ9IkxheWVyXzExIi8+CiAgICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDYzLjYgMTA1Ni42YzI0LjggMCA0NSAyMC4xIDQ1IDQ1IDAgMjQuOC0yMC4xIDQ1LTQ1IDQ1cy00NS0yMC4xLTQ1LTQ1Yy4xLTI0LjggMjAuMi00NSA0NS00NXoiIGlkPSJMYXllcl8xMiIvPgogICAgPGcgaWQ9IlNUUk9LRVMiPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik00MTguNyAxMTAxLjZjMCAyNC44IDIwLjEgNDUgNDUgNDVzNDUtMjAuMSA0NS00NWMwLTI0LjgtMjAuMS00NS00NS00NXMtNDUgMjAuMi00NSA0NXoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTcwMy4xIDEwODEuMlY5NDMuOEwxNDkyIDEwOTkuNmMtMTAxLjktMTc2LjktMzg0LjYtMjczLjEtMzg0LjYtMjczLjFWNjMzLjNMODMzLjcgNzkyLjVjLTEwLjQgMC0yMC42LjItMzAuNy42LTY2LjkgMi44LTEyNy41IDE0LjctMTgyLjEgMzIuNy0xNS41IDUuMS0zMC41IDEwLjctNDUgMTYuNy0yNTEuMSAxMDQuMS0zNTkgMzM0LjMtMzU5IDMzNC4zbDEzNy4zIDEwOS40LTEwOC4yIDQ5LjdzOTAuMiAxNjQgMzI5LjYgMjU1LjdjOTIuOCAzNS42IDIwOC4xIDYwLjIgMzQ5LjMgNjAuMiAyNDYgMCA0NjktMTYyLjYgNTU1LjktMjY5LjJsMjIyLjIgMTI5LjV2LTQzMC45eiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik01NzUuOSA4NDIuNlM3NjEgOTUxLjUgNzYxIDEyMDMuM3MtMTg1LjEgMzg3LjUtMTg1LjEgMzg3LjUiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNODU1IDE0MzAuMmwxNTYuMSAxMzAuNyA4LjktMTY0LjgiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTUwNSAxMjM4LjdoMTk4LjEiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTU3MyAxMzI0LjFsMTMwLjEgNzIiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTcwMy4xIDEwODEuMmwtMTMwLjEgNzIiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNDc2LjEgMzY5YzAgNTUuNy00NS4xIDEwMC45LTEwMC45IDEwMC45UzI3NC40IDQyNC43IDI3NC40IDM2OXM0NS4xLTEwMC45IDEwMC45LTEwMC45UzQ3Ni4xIDMxMy4zIDQ3Ni4xIDM2OXoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNjIwLjkgODI1LjlDNTczLjQgODAxLjEgNTQxIDc1MS4zIDU0MSA2OTRjMC04Mi4xIDY2LjYtMTQ4LjcgMTQ4LjctMTQ4LjdTODM4LjQgNjExLjkgODM4LjQgNjk0YzAgMzYuOC0xMy40IDcwLjQtMzUuNSA5Ni40Ii8+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxNi45IDc0My40YzAgMzguOSAzMS42IDcwLjUgNzAuNSA3MC41czcwLjUtMzEuNiA3MC41LTcwLjVjMC0zOS0zMS42LTcwLjUtNzAuNS03MC41cy03MC41IDMxLjUtNzAuNSA3MC41eiIvPgogICAgPC9nPgo8L3N2Zz4K',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDE5MjAiPgogICAgPHN0eWxlPgogICAgICAgIC5zdDB7ZmlsbDojZmZmfS5zdDF7ZmlsbDpub25lO3N0cm9rZTojMjMxZjIwO3N0cm9rZS13aWR0aDo1MDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTB9CiAgICA8L3N0eWxlPgogICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTYyMi4yIDYwM2MwIDI5LjEtMjMuNiA1Mi42LTUyLjYgNTIuNlM1MTcgNjMyIDUxNyA2MDNjMC0yOS4xIDIzLjYtNTIuNiA1Mi42LTUyLjZzNTIuNiAyMy42IDUyLjYgNTIuNnptMzUzLjcgMzAxYy0yOS4xIDAtNTIuNiAyMy42LTUyLjYgNTIuNnMyMy42IDUyLjYgNTIuNiA1Mi42YzI5LjEgMCA1Mi42LTIzLjYgNTIuNi01Mi42UzEwMDUgOTA0IDk3NS45IDkwNHptLTIxMC41IDQzNC40Yy0yOS4xIDAtNTIuNiAyMy42LTUyLjYgNTIuNnMyMy42IDUyLjYgNTIuNiA1Mi42YzI5LjEgMCA1Mi42LTIzLjYgNTIuNi01Mi42cy0yMy41LTUyLjYtNTIuNi01Mi42em02NTMuMy0zODEuOGMtMjkuMSAwLTUyLjYgMjMuNi01Mi42IDUyLjZzMjMuNiA1Mi42IDUyLjYgNTIuNiA1Mi42LTIzLjYgNTIuNi01Mi42LTIzLjUtNTIuNi01Mi42LTUyLjZ6bS0xODIuMyAzNzEuM2MtMjkuMSAwLTUyLjYgMjMuNi01Mi42IDUyLjZzMjMuNiA1Mi42IDUyLjYgNTIuNiA1Mi42LTIzLjYgNTIuNi01Mi42LTIzLjUtNTIuNi01Mi42LTUyLjZ6bS0yMjMuOC04NTEuMmMtMjkuMSAwLTUyLjYgMjMuNi01Mi42IDUyLjZzMjMuNiA1Mi42IDUyLjYgNTIuNiA1Mi42LTIzLjYgNTIuNi01Mi42LTIzLjUtNTIuNi01Mi42LTUyLjZ6bTM1My41IDEzN2MtMjkuMSAwLTUyLjYgMjMuNi01Mi42IDUyLjYgMCAyOS4xIDIzLjYgNTIuNiA1Mi42IDUyLjZzNTIuNi0yMy42IDUyLjYtNTIuNi0yMy42LTUyLjYtNTIuNi01Mi42ek00NzguMyA5ODcuMWMtMjkuMSAwLTUyLjYgMjMuNi01Mi42IDUyLjYgMCAyOS4xIDIzLjYgNTIuNiA1Mi42IDUyLjYgMjkuMSAwIDUyLjYtMjMuNiA1Mi42LTUyLjYuMS0yOS0yMy41LTUyLjYtNTIuNi01Mi42eiIgaWQ9IkxheWVyXzMiLz4KICAgIDxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05NjAgMjE2LjljLTQxMC40IDAtNzQzLjEgMzMyLjctNzQzLjEgNzQzLjEgMCA0MTAuNCAzMzIuNyA3NDMuMSA3NDMuMSA3NDMuMSA0MTAuNCAwIDc0My4xLTMzMi43IDc0My4xLTc0My4xIDAtNDEwLjQtMzMyLjctNzQzLjEtNzQzLjEtNzQzLjF6bS00ODEuNyA4NzUuNWMtMjkuMSAwLTUyLjYtMjMuNi01Mi42LTUyLjZzMjMuNi01Mi42IDUyLjYtNTIuNmMyOS4xIDAgNTIuNiAyMy42IDUyLjYgNTIuNnMtMjMuNSA1Mi42LTUyLjYgNTIuNnptOTEuMi00MzYuN2MtMjkuMSAwLTUyLjYtMjMuNi01Mi42LTUyLjYgMC0yOS4xIDIzLjYtNTIuNiA1Mi42LTUyLjZzNTIuNiAyMy42IDUyLjYgNTIuNmMuMSAyOS0yMy41IDUyLjYtNTIuNiA1Mi42em0xOTUuOSA3ODhjLTI5LjEgMC01Mi42LTIzLjYtNTIuNi01Mi42czIzLjYtNTIuNiA1Mi42LTUyLjZjMjkuMSAwIDUyLjYgMjMuNiA1Mi42IDUyLjZzLTIzLjUgNTIuNi01Mi42IDUyLjZ6bTIxMC41LTQzNC40Yy0yOS4xIDAtNTIuNi0yMy42LTUyLjYtNTIuNiAwLTI5LjEgMjMuNi01Mi42IDUyLjYtNTIuNiAyOS4xIDAgNTIuNiAyMy42IDUyLjYgNTIuNi4xIDI5LTIzLjUgNTIuNi01Mi42IDUyLjZ6bTM2LjctNDI3LjRjLTI5LjEgMC01Mi42LTIzLjYtNTIuNi01Mi42IDAtMjkuMSAyMy42LTUyLjYgNTIuNi01Mi42czUyLjYgMjMuNiA1Mi42IDUyLjZjLjEgMjktMjMuNSA1Mi42LTUyLjYgNTIuNnptMjIzLjggODUxLjNjLTI5LjEgMC01Mi42LTIzLjYtNTIuNi01Mi42IDAtMjkuMSAyMy42LTUyLjYgNTIuNi01Mi42IDI5LjEgMCA1Mi42IDIzLjYgNTIuNiA1Mi42cy0yMy41IDUyLjYtNTIuNiA1Mi42em03Ny03NjYuOGMwLTI5LjEgMjMuNi01Mi42IDUyLjYtNTIuNiAyOS4xIDAgNTIuNiAyMy42IDUyLjYgNTIuNiAwIDI5LjEtMjMuNiA1Mi42LTUyLjYgNTIuNnMtNTIuNi0yMy42LTUyLjYtNTIuNnptMTA1LjMgMzk1LjVjLTI5LjEgMC01Mi42LTIzLjYtNTIuNi01Mi42czIzLjYtNTIuNiA1Mi42LTUyLjZjMjkuMSAwIDUyLjYgMjMuNiA1Mi42IDUyLjZzLTIzLjUgNTIuNi01Mi42IDUyLjZ6IiBpZD0iTGF5ZXJfMiIvPgogICAgPGcgaWQ9IlNUUk9LRVMiPgogICAgICAgIDxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjU2OS41IiBjeT0iNjAzIiByPSI1Mi42Ii8+CiAgICAgICAgPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iOTc1LjkiIGN5PSI5NTYuNiIgcj0iNTIuNiIvPgogICAgICAgIDxjaXJjbGUgY2xhc3M9InN0MSIgY3g9Ijc2NS40IiBjeT0iMTM5MSIgcj0iNTIuNiIvPgogICAgICAgIDxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjE0MTguNyIgY3k9IjEwMDkuMyIgcj0iNTIuNiIvPgogICAgICAgIDxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjEyMzYuNCIgY3k9IjEzODAuNSIgcj0iNTIuNiIvPgogICAgICAgIDxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjEwMTIuNiIgY3k9IjUyOS4zIiByPSI1Mi42Ii8+CiAgICAgICAgPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iMTM2Ni4xIiBjeT0iNjY2LjQiIHI9IjUyLjYiLz4KICAgICAgICA8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI0NzguMyIgY3k9IjEwMzkuOCIgcj0iNTIuNiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik05NjAgMTcwMy4xYy00MTAuNCAwLTc0My4xLTMzMi43LTc0My4xLTc0My4xIDAtNDEwLjQgMzMyLjctNzQzLjEgNzQzLjEtNzQzLjEgNDEwLjQgMCA3NDMuMSAzMzIuNyA3NDMuMSA3NDMuMSAwIDQxMC40LTMzMi43IDc0My4xLTc0My4xIDc0My4xeiIvPgogICAgPC9nPgo8L3N2Zz4K',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDE5MjAiPgogICAgPHN0eWxlPgogICAgICAgIC5zdDB7ZmlsbDojZmZmfS5zdDF7ZmlsbDojZDUwMDAwfS5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMjMxZjIwO3N0cm9rZS13aWR0aDo1MDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTB9CiAgICA8L3N0eWxlPgogICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTEzMjIgMTA1Ny44TDMxMi42IDE3MDguMWwtNDguNi03NS41IDEwMTEtNjUxLjNjLTExLjggMzQuNiAxMS4zIDcxLjQgNDcgNzYuNXoiIGlkPSJMYXllcl84Ii8+CiAgICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTMzMC4xIDg2Ni4zYzkuNy0xNi45IDIzLjQtMzEuOCA0MS00My4xIDU5LjctMzguNSAxMzkuNy0yMCAxNzYuMyA0MS42IDMzLjcgNTYuNyAxNy4yIDEzMS0zNy4zIDE2OC4xLS40LjItLjguNS0xLjEuOC0xNi42IDkuNi0zNC4zIDE2LjUtNTMuMSAyMC0xLjguMi0zLjUuNC01LjMuNmwuMS4xLTQuMy4yYy0xLjkuMS0zLjcuMi01LjYuMmwtMzIuNCAxLjFjLTU0LjItMy4xLTk5LTMxLjktMTMyLjktNzUuOS43LTEuOCAxLjQtMy42IDIuMy01LjNsNDUuMy05NGMxLjgtNC4zIDMuOC04LjYgNi4yLTEyLjhsLjgtMS43di4xeiIgaWQ9IkxheWVyXzkiLz4KICAgIDxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMjc1LjUgOTc5LjljLTc1LjEtOTcuNC05Ni4yLTI2OC45LTQ1LTM5Ny4zIDUtMTIuNSAxMC4zLTI1IDE1LjktMzcuNCAzNC4xIDUxLjcgNzcuOSA5Ni4zIDEzMS40IDEwOC4xIDAgMCA5MS40LTIxNy40IDczLjktNDQwLjMuNi0uNy45LTEuMS45LTEuMWguNnMxMzAuMSAxOTYuNCAxODcuMiAzODkuNWM0Ni4zIDE1Ni43LTEzLjQgMzY0LTEzMS40IDQzMi4yLjQtLjIuOC0uNSAxLjEtLjggNTQuNS0zNy4xIDcxLTExMS40IDM3LjMtMTY4LjEtMzYuNi02MS42LTExNi42LTgwLTE3Ni4zLTQxLjYtMTcuNSAxMS4zLTMxLjMgMjYuMi00MSA0My4xbC0uMS0uMS0uOCAxLjdjLTIuMyA0LjEtNC4zIDguNC02LjIgMTIuOGwtNDUuMyA5NGMtLjggMS43LTEuNSAzLjUtMi4yIDUuM3oiIGlkPSJMYXllcl8yIi8+CiAgICA8ZyBpZD0iU1RST0tFUyI+CiAgICAgICAgPGcgaWQ9IlhNTElEXzFfIj4KICAgICAgICAgICAgPHBhdGggY2xhc3M9InN0MiIgZD0iTTEzMjQgMTA1Ni41bC0yIDEuMy0xMDA5LjQgNjUwLjMtNDguNy03NS40TDEyNzUgOTgxLjNsLjQtLjMiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9InN0MiIgZD0iTTE0MDguNCAxMDU1LjhsMzIuNC0xLjFjMS45IDAgMy43LS4xIDUuNi0uMmw0LjMtLjItLjEtLjFjMS44LS4yIDMuNS0uNCA1LjMtLjYgMTguNC0yLjQgMzYuNi05IDUzLjEtMjAgLjQtLjIuOC0uNSAxLjEtLjggNTQuNS0zNy4xIDcxLTExMS40IDM3LjMtMTY4LjEtMzYuNi02MS42LTExNi42LTgwLTE3Ni4zLTQxLjYtMTcuNSAxMS4zLTMxLjMgMjYuMi00MSA0My4xbC0uMS0uMS0uOCAxLjdjLTIuMyA0LjEtNC4zIDguNC02LjIgMTIuOGwtNDUuMyA5NGMtLjkgMS44LTEuNiAzLjUtMi4zIDUuMy0uMi41LS4zIDEtLjUgMS40LTExLjggMzQuNiAxMS4zIDcxLjUgNDYuOSA3Ni41IDMuNC41IDYuOS43IDEwLjUuNmw3Ni4xLTIuNnoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9InN0MiIgZD0iTTE1MDkgMTAzMy42YzExNy45LTY4LjIgMTc3LjctMjc1LjUgMTMxLjQtNDMyLjItNTctMTkzLTE4Ny4yLTM4OS41LTE4Ny4yLTM4OS41aC0uNnMtLjMuNC0uOSAxLjFjMTcuNSAyMjIuOC03My45IDQ0MC4zLTczLjkgNDQwLjMtNTMuNS0xMS45LTk3LjQtNTYuNC0xMzEuNC0xMDguMS01LjYgMTIuNC0xMC45IDI0LjktMTUuOSAzNy40LTUxLjIgMTI4LjQtMzAuMSAyOTkuOSA0NSAzOTcuMyAzMy45IDQ0IDc4LjcgNzIuOSAxMzIuOSA3NS45LjYgMCAxLjIuMSAxLjguMWw3LjkuNGMxMyAuNiAyNS42LS4zIDM3LjgtMi43IDE4LjctMy42IDM2LjUtMTAuNCA1My4xLTIweiIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDE5MjAiPgogICAgPHN0eWxlPgogICAgICAgIC5zdDB7ZmlsbDojZmZmfS5zdDF7ZmlsbDpub25lO3N0cm9rZTojMjMxZjIwO3N0cm9rZS13aWR0aDo1MDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTB9CiAgICA8L3N0eWxlPgogICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTE3MDEuMiAxNzAxLjJIMjE2LjlWMjE2Ljl6IiBpZD0iTGF5ZXJfMSIvPgogICAgPHBhdGggY2xhc3M9InN0MSIgZD0iTTE3MDEuMiAxNzAxLjJIMjE2LjlWMjE2Ljl6IiBpZD0iU1RST0tFUyIvPgo8L3N2Zz4K',
];

function loadImages(paths, whenLoaded) {
    const images = [];
    paths.forEach((path) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        // img.setAttribute('crossOrigin', '');
        img.onload = function () {
            images.push(img);
            if (images.length === paths.length) {
                whenLoaded(images);
            }
        };
        img.src = path;
    });
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
    //通过 ctx.getImageData 获取所有像素的 rgba 值，因此 data 里会有100x100x4=40000个值，每4个值对应一个像素上的 rgba 值。
    const data = ctx.getImageData(0, 0, size, size).data;
    const imageCoords = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const red = data[(y * size + x) * 4];
            // const green = data[(y * size + x) * 4 + 1];
            // const blue = data[(y * size + x) * 4 + 2];
            // const alpha = data[(y * size + x) * 4 + 3];
            if (red > 0 && red < 50) {
                imageCoords.push([x / size - 0.5, 0.5 - y / size]);
            }
        }
    }
    return imageCoords;
}

const count = 13000;

function setGeometryAttributes(imageCoords) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
        const [x, y] = getRandomValue(imageCoords);
        const scale = 3;
        const z = Math.random();
        positions.set([x * scale, y * scale, z * -0.3], i);
    }
    return positions;
}

function getRandomValue(data) {
    return data[Math.floor(Math.random() * data.length)];
}

const COLORS = [
    "rgb(244,67,54)",
    "rgb(233,30,99)",
    "rgb(156,39,176)",
    "rgb(103,58,183)",
    "rgb(63,81,181)",
    "rgb(33,150,243)",
    "rgb(3,169,244)",
    "rgb(0,188,212)",
    "rgb(0,150,136)",
    "rgb(76,175,80)",
    "rgb(139,195,74)",
    "rgb(205,220,57)",
    "rgb(255,235,59)",
    "rgb(255,193,7)",
    "rgb(255,152,0)",
    "rgb(255,87,34)",
];

const vertexShader = /* GLSL */ `
        attribute float aOffset;
        attribute vec3 position1;
        uniform float uTime;
        uniform float uProgress;
        varying float vDepth;
        varying float vProgress;

        const float PI = 3.141592653589793238;

        void main() {
            float progress = abs(sin(uTime/2.0));
            vProgress = progress;

            vec3 newPos = mix(position, position1, uProgress);
            // vDepth = position.z;
            vDepth = mix(position.z, position1.z, uProgress);
            newPos.z += 0.03 * sin(aOffset * PI * 2.0 + uTime * 5.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
            gl_PointSize = 12.0;
        }
    `;

const fragmentShader = /* GLSL */ `
        ${rgb2hsl}

        uniform float uProgress;
        uniform vec3 uColor;
        uniform vec3 uColor1;

        varying float vDepth;
        varying float vProgress;

        vec3 setColor(vec3 color, float depth) {
            float value = depth / -0.3 * 30.0;
            float r = clamp(color.r - value * 5.0/255.0, 0.0, 1.0);
            float g = clamp(color.g - value * 5.0/255.0, 0.0, 1.0);
            float b = clamp(color.b - value * 5.0/255.0, 0.0, 1.0);
            return vec3(r, g, b);
        }

        void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            float mask = smoothstep(0.5, 0.499, dist);
            vec3 color = mix(uColor1, uColor, uProgress);
            color = setColor(uColor, vDepth);
            // 1.0 * mask 这里相当于用mask和最终的透明度相乘，如果mask为0，那么最终的透明度就是0，如果mask为1，那么最终的透明度就是1
            gl_FragColor = vec4(color, 1.0 * mask);
        }
    `;

let current = 0;
let geometry, material, points;
let geometryAttributes = [];
loadImages(paths, function (images) {
    images.forEach((img) => {
        const imageCoords = getImageCoords(img);
        geometryAttributes.push(setGeometryAttributes(imageCoords));
    });

    geometry = new THREE.BufferGeometry();

    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        offsets.set([Math.random()], i);
    }
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(geometryAttributes[current], 3)
    );
    geometry.setAttribute(
        "position1",
        new THREE.BufferAttribute(geometryAttributes[current], 3)
    );

    geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

    const color = new THREE.Color(getRandomValue(COLORS));
    material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uColor: { value: color },
            uColor1: { value: color },
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
let clock = new THREE.Clock();
function animate() {
    let time = clock.getElapsedTime();
    if (material) material.uniforms.uTime.value = time;

    renderer.render(scene, camera);
    controls.update()
    requestAnimationFrame(animate);
}

animate();

// 点击页面，让粒子系统执行动画
let animating = false;
window.addEventListener("click", () => {
    if (!animating) {
        animating = true;
        current++;
        current = current % paths.length;

        geometry.attributes.position1.array = geometryAttributes[current];
        geometry.attributes.position1.needsUpdate = true;
        const color = new THREE.Color(getRandomValue(COLORS));
        console.log(color);
        
        material.uniforms.uColor1.value = color;

        gsap.to(material.uniforms.uProgress, {
            value: 1,
            onComplete: () => {
                animating = false;
                geometry.attributes.position.array = geometryAttributes[current];
                geometry.attributes.position.needsUpdate = true;
                material.uniforms.uColor.value = color;
                material.uniforms.uProgress.value = 0;
            },
        });
    }
});

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

