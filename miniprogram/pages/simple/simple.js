'use strict';

var threePlatformize = require('../../chunks/three-platformize.js');
var GLTFLoader = require('../../chunks/GLTFLoader.js');
var threePlatformizeDemo = require('../../chunks/three-platformize-demo.js');

Page({
  disposing: false,
  platform: null ,
  frameId: -1,

  onReady() {
    console.log('ready');
    tt.createSelectorQuery().select('#gl').node().exec(async (res) => {
      const canvas = res[0].node;
      console.log('init scene');

      this.platform = new GLTFLoader.BytePlatform(canvas);
      threePlatformize.PLATFORM.set(this.platform);

      const renderer = new threePlatformize.WebGL1Renderer({ canvas, antialias: true, alpha: true });
      const camera = new threePlatformize.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
      const scene = new threePlatformize.Scene();
      const gltfLoader = new GLTFLoader.GLTFLoader();
      const textureLoader = new threePlatformize.TextureLoader();
      const controls = new threePlatformizeDemo.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      console.log(canvas.width, canvas.height, threePlatformize.$window.devicePixelRatio);

      {
        const geometry = new threePlatformize.PlaneGeometry(1, 1);
        const material = new threePlatformize.MeshBasicMaterial({ color: 0x123456 });
        const mesh = new threePlatformize.Mesh(geometry, material);
        scene.add(mesh);
      }

      {
        const geometry = new threePlatformize.PlaneGeometry(1, 1);
        const material = new threePlatformize.MeshBasicMaterial({
          map: textureLoader.load(
            'https://cdn.static.oppenlab.com/weblf/test/open%20mouth.jpg',
            (tex) => {
              tex.encoding = threePlatformize.LinearEncoding;
              console.log('texture loaded');
            },
            undefined,
            (e) => console.log('texture load error', e),
          ),
        });
        const mesh = new threePlatformize.Mesh(geometry, material);
        mesh.position.y = 1;
        scene.add(mesh);
      }

      gltfLoader.loadAsync('https://dtmall-tel.alicdn.com/edgeComputingConfig/upload_models/1591673169101/RobotExpressive.glb').then((gltf) => {
        // @ts-ignore
        gltf.parser = null;
        gltf.scene.position.y = -2;
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        scene.add(gltf.scene);
      });

      scene.background = new threePlatformize.Color(0x654321);

      camera.position.z = 5;
      renderer.outputEncoding = threePlatformize.sRGBEncoding;
      scene.add(new threePlatformize.AmbientLight(0xffffff, 1.0));
      scene.add(new threePlatformize.DirectionalLight(0xffffff, 1.0));

      // 设置dpr后图像不居中
      // renderer.setPixelRatio($window.devicePixelRatio)
      renderer.setSize(canvas.width, canvas.height, false);

      const render = () => {
        if (!this.disposing) this.frameId = threePlatformize.$requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
      };
      render();
    });
  },

  onUnload() {
    this.disposing = true;
    threePlatformize.$cancelAnimationFrame(this.frameId);
    threePlatformize.PLATFORM.dispose();
  },

  onTX(e) {
    this.platform.dispatchTouchEvent(e);
  },
});
