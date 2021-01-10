import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
// import World from './world.js';


let HORSE_DIRECTION = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
};
const container = document.querySelector('#scene-container');

// const world = new World(container);
// world.render();
// define some essential variables:
let scene, renderer, camera, gltfLoader;

scene = new THREE.Scene();

// renderer
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
document.body.appendChild(renderer.domElement);

// Camera
camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(0,30,60);
camera.lookAt(scene.position);
scene.add(camera);

// Camera controls
var cameraControl = new OrbitControls(camera, renderer.domElement);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;

// Light(s)
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8);
directionalLight.position.set(20.0,20.0,20.0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.zoom=0.7;
scene.add(directionalLight);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

gltfLoader = new GLTFLoader();

const clock = new THREE.Clock();
let direction = HORSE_DIRECTION.LEFT;
let horseScene;
gltfLoader.load( './assets/deniseHorse_withHairHelmet.glb', function ( gltf ) {
    horseScene = gltf.scene;
    let mixers = []

    const horse_clip = gltf.animations[1];
    const horse_mixer = new THREE.AnimationMixer(horseScene.children[3]);
    const horse_action = horse_mixer.clipAction(horse_clip);
    horse_action.play();
    mixers.push(horse_mixer);

    const horse_left = gltf.animations[2];
    const horse_mixer_L = new THREE.AnimationMixer(horseScene.children[3]);
    const horse_left_action = horse_mixer_L.clipAction(horse_left);
    horse_left_action.play();
    mixers.push(horse_mixer_L);

    const horse_right = gltf.animations[3];
    const horse_mixer_R = new THREE.AnimationMixer(horseScene.children[3]);
    const horse_right_action = horse_mixer_R.clipAction(horse_right);
    horse_right_action.play();
    mixers.push(horse_mixer_R);

    const saddle_clip = gltf.animations[0];
    const saddle_mixer = new THREE.AnimationMixer(horseScene.children[4]);
    const saddle_action = saddle_mixer.clipAction(saddle_clip);
    saddle_action.play();
    mixers.push(saddle_mixer);

    const denise_clip = gltf.animations[4];
    const denise_mixer = new THREE.AnimationMixer(horseScene.children[2]);
    const denise_action = denise_mixer.clipAction(denise_clip);
    denise_action.play();
    mixers.push(denise_mixer);
    
    horseScene.tick = (delta) => {
        let index_horse = direction === HORSE_DIRECTION.LEFT ? 1 : (direction === HORSE_DIRECTION.RIGHT ? 2 : 0);
        for (let i = 0; i < mixers.length; i++) {
            if (i > 2 || i === index_horse) {
                mixers[i].update(delta);
            }
        }
    }

    horseScene.setTime = (delta) => {
        let index_horse = direction === HORSE_DIRECTION.LEFT ? 1 : (direction === HORSE_DIRECTION.RIGHT ? 2 : 0);
        for (let i = 0; i < mixers.length; i++) {
            if (i > 2 || i === index_horse) {
                mixers[i].setTime(delta);
            }
        }
    }

    horseScene.traverse( function( child ) { 
        if ( child.isMesh ) {
            child.castShadow = true;
        }
    });

    horseScene.scale.set(0.1, 0.1, 0.1);
	scene.add(horseScene);

}, undefined, function ( error ) {
	console.error( error );
} );

// const lightHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(lightHelper);

// DRAW ENVIRONMENT MAP
var skyboxCubemap = new THREE.CubeTextureLoader()
  .setPath( 'img/' )
  .load( [
    'negx.png',
    'posx.png',
    'posy.png',
    'negy.png',
    'posz.png',
    'negz.png',
  ] );
skyboxCubemap.format = THREE.RGBFormat;
var skyboxMaterial = new THREE.MeshBasicMaterial({
    envMap: skyboxCubemap,
    side: THREE.DoubleSide
  });


  var skyboxGeometry = new THREE.BoxGeometry(1000,1000,1000);
  var skybox = new THREE.Mesh(skyboxGeometry,skyboxMaterial);
  scene.add(skybox);
  
// draw the plane
const texture = new THREE.TextureLoader().load( 'img/sand.jpg' );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4,4);

// immediately use the texture for material creation
const material = new THREE.MeshBasicMaterial( { map: texture } );
const geometry = new THREE.PlaneGeometry( 60, 60, 32 );
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
plane.rotation.set(- Math.PI / 2, 0, 0);
scene.add(plane);

// Functions
var keyboard = new THREEx.KeyboardState();
let lastKeyPressed;
function checkKeyboard() {
    if (keyboard.pressed('left')) {
        direction = HORSE_DIRECTION.LEFT;
        callTick(lastKeyPressed !== 'left');
        horseScene.rotation.y += 0.05;
        lastKeyPressed = 'left';
    }
    if (keyboard.pressed('right')) {
        direction = HORSE_DIRECTION.RIGHT;
        callTick(lastKeyPressed !== 'right');
        horseScene.rotation.y -= 0.05;
        lastKeyPressed = 'right';
    }
    if(keyboard.pressed('up')) {
        direction = HORSE_DIRECTION.CENTER;
        callTick(lastKeyPressed !== 'up');
        horseScene.translateZ(0.5);
        lastKeyPressed = 'up';
    }
    if(keyboard.pressed('down')) {
        direction = HORSE_DIRECTION.CENTER;
        callTick(lastKeyPressed !== 'down');
        horseScene.translateZ(-0.5);
        lastKeyPressed = 'down';
    }
}

function callTick(newDirection) {
    if (newDirection) {
        horseScene.setTime(0);
    } else {
        const delta = clock.getDelta();
        horseScene.tick(delta);
    }
}

// Loop Functions
function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    checkKeyboard();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);
animate();