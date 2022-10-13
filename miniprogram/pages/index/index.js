'use strict';

var threePlatformize = require('../../chunks/three-platformize.js');
var GLTFLoader = require('../../chunks/GLTFLoader.js');
var threePlatformizeDemo = require('../../chunks/three-platformize-demo.js');

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// index.ts

console.log('THREE Version', threePlatformize.REVISION);

const DEMO_MAP = {
  // BasisLoader: DemoBasisLoader,
  // MemoryTest: DemoMemoryTest,

  // MeshOpt: DemoMeshOpt,
  TGALoader: threePlatformizeDemo.DemoTGALoader,
  PDBLoader: threePlatformizeDemo.DemoPDBLoader,
  STLLoader: threePlatformizeDemo.DemoSTLLoader,
  TTFLoader: threePlatformizeDemo.DemoTTFLoader,
  BVHLoader: threePlatformizeDemo.DemoBVHLoader,
  FBXLoader: threePlatformizeDemo.DemoFBXLoader,
  LWOLoader: threePlatformizeDemo.DemoLWOLoader,
  MTLLoader: threePlatformizeDemo.DemoMTLLoader,
  EXRLoader: threePlatformizeDemo.DemoEXRLoader,
  OBJLoader: threePlatformizeDemo.DemoOBJLoader,
  SVGLoader: threePlatformizeDemo.DemoSVGLoader,
  RGBELoader: threePlatformizeDemo.DemoRGBELoader,
  GLTFLoader: threePlatformizeDemo.DemoGLTFLoader,
  ColladaLoader: threePlatformizeDemo.DemoColladaLoader,
  // MeshQuantization: DemoMeshQuantization,
  ThreeSpritePlayer: threePlatformizeDemo.DemoThreeSpritePlayer,
  HDRPrefilterTexture: threePlatformizeDemo.DemoHDRPrefilterTexture,
  DeviceOrientationControls: threePlatformizeDemo.DemoDeviceOrientationControls,
};

const getNode = id =>
  new Promise(r =>
    tt
      .createSelectorQuery()
      .select(id)
      .node()
      .exec(r),
  );

// @ts-ignore
Page({
  disposing: false,
  switchingItem: false,
  deps: {} ,
  currDemo: null ,
  platform: null ,
  helperCanvas: null ,

  data: {
    showMenu: true,
    showCanvas: false,
    currItem: -1,
    menuList: [
      'GLTFLoader',
      'ThreeSpritePlayer',
      // 'DeviceOrientationControls',
      'RGBELoader',
      'SVGLoader',
      'OBJLoader',
      // 'MeshOpt',
      'EXRLoader',
      'HDRPrefilterTexture',
      'MTLLoader',
      'LWOLoader',
      'FBXLoader',
      'BVHLoader',
      'ColladaLoader',
      // 'MeshQuantization',
      'TTFLoader',
      'STLLoader',
      'PDBLoader',
      'TGALoader',
      // 'MemoryTest',
      // 'BasisLoader(TODO)',
      // 'Raycaster(TODO)',
      // 'Geometry(TODO)',
    ],
  },

  onReady() {
    this.onCanvasReady();
  },

  onCanvasReady() {
    console.log('onCanvasReady');
    Promise.all([getNode('#gl'), getNode('#canvas')]).then(
      ([glRes, canvasRes]) => {
        // @ts-ignore
        this.initCanvas(glRes[0].node, canvasRes[0].node);
      },
    );
  },

  initCanvas(canvas, helperCanvas) {
    const platform = new GLTFLoader.BytePlatform(canvas);
    this.platform = platform;
    // platform.enableDeviceOrientation('game');
    threePlatformize.PLATFORM.set(platform);
    let {width,height} = canvas;
    console.log(canvas.width,canvas.height)
    let gl = canvas.getContext('webgl');
    let {pixelRatio}  = tt.getSystemInfoSync();

    gl.canvas.width = width * pixelRatio
    gl.canvas.height = height * pixelRatio
    gl.viewport(0, 0, width * pixelRatio, height * pixelRatio);
    console.log(threePlatformize.$window.innerWidth, threePlatformize.$window.innerHeight);
    console.log(canvas.width, canvas.height);

    const renderer = new threePlatformize.WebGL1Renderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    const camera = new threePlatformize.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000,
    );
    const scene = new threePlatformize.Scene();
    const clock = new threePlatformize.Clock();
    const gltfLoader = new GLTFLoader.GLTFLoader();
    const textureLoader = new threePlatformize.TextureLoader();

    this.deps = { renderer, camera, scene, clock, gltfLoader, textureLoader };
    this.helperCanvas = helperCanvas;

    scene.position.z = -3;
    scene.background = new threePlatformize.Color(0xffffff);
    renderer.outputEncoding = threePlatformize.sRGBEncoding;
    // renderer.setPixelRatio(2);
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

    const render = () => {
      if (this.disposing) return;
      threePlatformize.$requestAnimationFrame(render);
      _optionalChain([(this.currDemo ), 'optionalAccess', _ => _.update, 'call', _2 => _2()]);
      renderer.render(scene, camera);
    };

    render();
    console.log('canvas inited');
  },

  onMenuClick() {
    const showMenu = !this.data.showMenu;
    if (showMenu) {
      this.setData({ showMenu, showCanvas: false });
    } else {
      this.setData({ showMenu });
      setTimeout(() => {
        this.setData({ showCanvas: true });
      }, 330);
    }
  },

  async onMenuItemClick(e) {
    const { i, item } = e.currentTarget.dataset;
    tt.showLoading({ mask: false, title: '加载中' });
    if (this.switchingItem || !DEMO_MAP[item]) return;

    _optionalChain([(this.currDemo ), 'optionalAccess', _3 => _3.dispose, 'call', _4 => _4()]);
    this.switchingItem = true;
    this.currDemo = null ;

    const demo = new DEMO_MAP[item](this.deps) ;
    await demo.init();
    this.currDemo = demo;
    this.setData({ currItem: i });
    this.onMenuClick();
    this.switchingItem = false;
    tt.hideLoading();
  },

  onTX(e) {
    console.log(e);
    this.platform.dispatchTouchEvent(e);
  },

  onUnload() {
    this.disposing = true;
    _optionalChain([(this.currDemo ), 'optionalAccess', _5 => _5.dispose, 'call', _6 => _6()]);
    threePlatformize.PLATFORM.dispose();
  },
});
