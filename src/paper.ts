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
    this.camera.position.set(10,10,10);
    this.camera.lookAt(this.scene.position);//カメラがシーンの中心を見るように

    this.createPaper();
    this.createPaperPhysicsObject();
    this.createGround();
    this.createGroundPhysicsObject();
  }

  private createPaper() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    this.paper = new THREE.Mesh(geometry, material);
    
    this.scene.add(this.paper);
  }

  private createPaperPhysicsObject() {
    const paperShape = new Ammo.btBoxShape(new Ammo.btVector3(this.width / 2, 0.1, this.height / 2));
    const paperMass = 5; // 紙の質量
    const paperInertia = new Ammo.btVector3(0, 0, 0); // 慣性モーメント
    paperShape.calculateLocalInertia(paperMass, paperInertia);
  
    const paperTransform = new Ammo.btTransform();
    paperTransform.setIdentity();

    // 紙の回転を設定
    const quat = new Ammo.btQuaternion();
    // X軸周りに90度回転させる（地面に平行にするため）
    quat.setValue(0, -Math.PI / 2, -Math.PI / 2, 0);
    paperTransform.setRotation(quat);

    paperTransform.setOrigin(new Ammo.btVector3(0, 8, 0)); // 初期位置
    const paperMotionState = new Ammo.btDefaultMotionState(paperTransform);
  
    const paperRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(paperMass, paperMotionState, paperShape, paperInertia);
    this.paperPhysicsObject = new Ammo.btRigidBody(paperRigidBodyInfo);
  
    this.physicsWorld.addRigidBody(this.paperPhysicsObject);
  }

  private createGround() {
    //地面のジオメトリを作成
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    //地面のマテリアルを作成
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide });
    //地面のメッシュを作成
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    //地面を回転させて水平にする
    ground.rotation.x = -Math.PI / 2;
    //地面の位置を設定（Y軸で少し下げるなど）
    ground.position.y = 0;
    //シーンに地面を追加
    this.scene.add(ground);

    //GridHelperを作成
    const size = 50; //格子のサイズ
    const divisions = 10; //格子の分割数
    const gridHelper = new THREE.GridHelper(size, divisions, 0x0000ff, 0x808080);
    gridHelper.position.y = 0.01; //地面のちょうど上に位置するように微調整
    this.scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private createGroundPhysicsObject() {
    //地面の物理シェイプを作成。ここでは無限平面を使用。
    const groundShape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 1, 0), 0);
    //地面の慣性モーメントは必要ない（静的オブジェクトのため）
    const groundMass = 0; // 静的オブジェクトなので質量は0
    const groundInertia = new Ammo.btVector3(0, 0, 0);
    //地面のトランスフォームを作成
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    //地面の位置を設定
    groundTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
    //地面の剛体情報を作成
    const groundRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundInertia);
    const groundRigidBody = new Ammo.btRigidBody(groundRigidBodyInfo);
    //物理世界に地面を追加
    this.physicsWorld.addRigidBody(groundRigidBody);
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
