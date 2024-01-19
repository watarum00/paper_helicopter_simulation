import * as THREE from 'three';

class PaperSimulation {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private paper: THREE.Mesh | null = null;
  private velocity = 0;
  private gravity  = -9.8;
  private dragCoefficient = 0.47;//紙の抗力係数（実際の値に応じて調整）
  private airDensity = 1.225;//空気密度（kg/m³）

  constructor(private width: number, private height: number) {
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

    //空気抵抗を計算
    const dragForce = -this.dragCoefficient * this.airDensity * this.velocity * this.velocity / 2;

    //重力と空気抵抗による速度の更新
    this.velocity += (this.gravity + dragForce) * 0.02;//0.02は1フレームごとの秒数の定義

    //紙の位置を更新
    if(this.paper){
      this.paper.position.y += this.velocity * 0.02;//位置=速度 * 時間

      //地面に達したら停止（仮にy座標が-5未満の場合）
      if (this.paper.position.y < -5) {
        this.velocity = 0;
        this.paper.position.y = -5;
      }
      this.renderer.render(this.scene, this.camera);
    }
  }
}

const runButton = document.getElementById('runButton');
if(runButton){
  runButton.addEventListener('click', () => {
    const simulation = new PaperSimulation(1, 1);
    simulation.startAnimation();
    simulation.render();
  });
}else{
  console.error('Run button not found');
}
