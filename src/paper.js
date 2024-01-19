"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
class PaperSimulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.paper = null;
        this.velocity = 0;
        this.gravity = -9.8;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.createPaper();
    }
    createPaper() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        this.paper = new THREE.Mesh(geometry, material);
        this.paper.position.set(0, 10, 0);
        this.scene.add(this.paper);
    }
    startAnimation() {
        this.animate();
    }
    render() {
        requestAnimationFrame(() => this.render());
        // レンダリングやアニメーションの更新
        this.renderer.render(this.scene, this.camera);
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        // 時間経過による速度の更新（重力加速度を使用）
        this.velocity += this.gravity * 0.02; // 仮にフレームごとに0.02秒経過したとする
        // 紙の位置を更新
        if (this.paper) {
            this.paper.position.y += this.velocity * 0.02; // 位置 = 速度 * 時間
            // 地面に達したら停止（仮にy座標が-5未満の場合）
            if (this.paper.position.y < -5) {
                this.velocity = 0;
                this.paper.position.y = -5;
            }
            this.renderer.render(this.scene, this.camera);
        }
    }
}
const runButton = document.getElementById('runButton');
if (runButton) {
    runButton.addEventListener('click', () => {
        const simulation = new PaperSimulation(1, 1);
        simulation.startAnimation();
        simulation.render();
    });
}
else {
    console.error('Run button not found');
}
