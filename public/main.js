import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
// import World from './world.js';

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
camera.position.set(0,15,30);
camera.lookAt(scene.position);
scene.add(camera);

var worldFrame = new THREE.AxesHelper(2);
scene.add(worldFrame);

// Camera controls
var cameraControl = new OrbitControls(camera, renderer.domElement);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;

// Light(s)
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8);
directionalLight.position.set(20.0,20.0,20.0);
directionalLight.target = worldFrame;
directionalLight.castShadow = true;
directionalLight.shadow.camera.zoom=0.7;
scene.add(directionalLight);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);


gltfLoader = new GLTFLoader();

// let donutScene;
// gltfLoader.load( './assets/donut.glb', function ( gltf ) {
//     donutScene = gltf.scene;
//     donutScene.traverse( function( child ) { 
//         if ( child.isMesh ) {
//             console.log('adding shadow cast');
//             child.castShadow = true;
//         }
//     });
//     donutScene.scale.set(30.0,30.0,30.0);
// 	scene.add(donutScene);

// }, undefined, function ( error ) {
// 	console.error( error );

// } );

// let donutScene;
// gltfLoader.load( './assets/donut_test3.glb', (gltf) => {
//     donutScene = gltf.scene;
//     console.log(donutScene);
//     donutScene.traverse( function( child ) { 
//         if ( child.isMesh ) {
//             console.log('adding shadow cast');
//             child.castShadow = true;
//         }
//     });
//     donutScene.scale.set(30.0,30.0,30.0);
// 	scene.add(donutScene);

// }, undefined, (error) => {
// 	console.error( error );
// } );

const clock = new THREE.Clock();
let horseScene;
gltfLoader.load( './assets/deniseHorseReal_2.glb', function ( gltf ) {
    horseScene = gltf.scene;

    console.log(horseScene);
    let mixers = []

    const horse_clip = gltf.animations[0];
    const horse_mixer = new THREE.AnimationMixer(horseScene.children[3]);
    const horse_action = horse_mixer.clipAction(horse_clip);
    horse_action.play();
    mixers.push(horse_mixer);

    const saddle_clip = gltf.animations[1];
    const saddle_mixer = new THREE.AnimationMixer(horseScene.children[4]);
    const saddle_action = saddle_mixer.clipAction(saddle_clip);
    saddle_action.play();
    mixers.push(saddle_mixer);

    const denise_clip = gltf.animations[2];
    const denise_mixer = new THREE.AnimationMixer(horseScene.children[2]);
    const denise_action = denise_mixer.clipAction(denise_clip);
    denise_action.play();
    mixers.push(denise_mixer);
    
    horseScene.tick = (delta) => {
        mixers.forEach(mixer => {
            mixer.update(delta);
        });
    }
    horseScene.traverse( function( child ) { 
        if ( child.isMesh ) {
            console.log('adding shadow cast');
            child.castShadow = true;
        }
    });
    horseScene.scale.set(0.1, 0.1, 0.1);
    // donutScene.scale.set(30.0,30.0,30.0);
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
const geometry = new THREE.PlaneGeometry( 20, 20, 32 );
// const material = new THREE.MeshBasicMaterial( {color: 0x429cf5, side: THREE.DoubleSide} );
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
plane.rotation.set(- Math.PI / 2, 0, 0);
scene.add(plane);

// Functions
var keyboard = new THREEx.KeyboardState();

function checkKeyboard() {
    if (keyboard.pressed('left')) {
        const delta = clock.getDelta();
        horseScene.tick(delta);
        horseScene.rotation.y += 0.05;
    }
    if (keyboard.pressed('right')) {
        const delta = clock.getDelta();
        horseScene.tick(delta);
        horseScene.rotation.y -= 0.05;
    }
    if(keyboard.pressed('up')) {
        const delta = clock.getDelta();
        horseScene.tick(delta);
        horseScene.translateZ(0.5);
    }
    if(keyboard.pressed('down')) {
        const delta = clock.getDelta();
        horseScene.tick(delta);
        horseScene.translateZ(-0.5);
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

    // cylinder.rotation.y += 0.001;
    // cylinder.rotation.x += 0.001;

    // donutScene.rotation.y += 0.005;
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);
animate();