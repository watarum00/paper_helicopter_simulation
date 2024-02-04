import * as THREE from 'three';
import Ammo from 'ammo.js';

class PaperSimulation {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private paper: THREE.Mesh | null = null;
  private gravity  = -9.8;
  private physicsWorld: any;
  private tmpTransfrom: any;
  private paperPhysicsObject: any;


  constructor(private width: number, private height: number) {
    this.initPhysics();
    this.init();
  }

  private async initPhysics(){
    //Ammo.jsの初期化が完了したら呼び出される
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    this.physicsWorld.setGravity(new Ammo.btVector3(0, this.gravity, 0));
  }

  private init(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);
    this.camera.position.set(0,10,5);
    this.camera.lookAt(this.scene.position);//カメラがシーンの中心を見るように

    this.createPaper();
    this.createPaperPhysicsObject();
  }

  private createPaper() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    this.paper = new THREE.Mesh(geometry, material);
    //地面に並行にするために回転
    this.paper.rotation.x = Math.PI / 2;
    this.paper.position.set(0, 10, 0);
    this.scene.add(this.paper);
  }

  private createPaperPhysicsObject() {
    const paperShape = new Ammo.btBoxShape(new Ammo.btVector3(this.width / 2, 0.1, this.height / 2));
    const paperMass = 1; // 紙の質量
    const paperInertia = new Ammo.btVector3(0, 0, 0); // 慣性モーメント
    paperShape.calculateLocalInertia(paperMass, paperInertia);
  
    const paperTransform = new Ammo.btTransform();
    paperTransform.setIdentity();
    paperTransform.setOrigin(new Ammo.btVector3(0, 10, 0)); // 初期位置
    const paperMotionState = new Ammo.btDefaultMotionState(paperTransform);
  
    const paperRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(paperMass, paperMotionState, paperShape, paperInertia);
    this.paperPhysicsObject = new Ammo.btRigidBody(paperRigidBodyInfo);
  
    this.physicsWorld.addRigidBody(this.paperPhysicsObject);
  }

  public startAnimation() {
    this.animate();
  }

  public render() {
    requestAnimationFrame(() => this.render());
    // レンダリングやアニメーションの更新
    this.renderer.render(this.scene, this.camera);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
  
    // 物理世界のステップを進める
    this.physicsWorld.stepSimulation(1 / 60, 10);
  
    // 紙の物理オブジェクトの位置と向きを取得
    const transform = new Ammo.btTransform();
    this.paperPhysicsObject.getMotionState().getWorldTransform(transform);
  
    // Three.jsのオブジェクトを更新
    const pos = transform.getOrigin();
    const quat = transform.getRotation();
    this.paper.position.set(pos.x(), pos.y(), pos.z());
    this.paper.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
  
    this.renderer.render(this.scene, this.camera);
  }
  
}

async function setupAmmo(){
  await Ammo();
}

const runButton = document.getElementById('runButton');
if(runButton){
  runButton.addEventListener('click', () => {
    setupAmmo();
    const simulation = new PaperSimulation(1, 1);
    simulation.startAnimation();
    simulation.render();
  });
}else{
  console.error('Run button not found');
}
