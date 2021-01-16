import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
// import World from './world.js';


let HORSE_DIRECTION = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
};

let GAIT = {
    WALK: 'walk',
    TROT: 'trot',
    CANTER: 'canter'
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
let gait = GAIT.WALK;
let horseScene;
gltfLoader.load( './assets/deniseHorseReal_trot.glb', function ( gltf ) {
    horseScene = gltf.scene;
    let mixers = createMixers(gltf);

    horseScene.tick = (delta) => {
        let index_horse = direction === HORSE_DIRECTION.LEFT ? 3 : (direction === HORSE_DIRECTION.RIGHT ? 4 : 2);
        let gait_num = gait === GAIT.CANTER ? 0 : (gait === GAIT.WALK ? 2 : 1);
        for (let i = 0; i < 5; i++) {
            if (i < 2 || i === index_horse) {
                mixers[gait_num][i].update(delta);
            }
        }
    }

    horseScene.setTime = (delta) => {
        let index_horse = direction === HORSE_DIRECTION.LEFT ? 3 : (direction === HORSE_DIRECTION.RIGHT ? 4 : 2);
        let gait_num = gait === GAIT.CANTER ? 0 : (gait === GAIT.WALK ? 2 : 1);
        for (let i = 0; i < 5; i++) {
            if (i < 2 || i === index_horse) {
                mixers[gait_num][i].setTime(delta);
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
const geometry = new THREE.PlaneGeometry( 100, 200, 32 );
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
plane.rotation.set(- Math.PI / 2, 0, 0);
scene.add(plane);

// Functions
var keyboard = new THREEx.KeyboardState();
let lastKeyPressed;
function checkKeyboard() {
    let speed = gait === GAIT.WALK ? 0.02 : (gait === GAIT.CANTER ? 0.06 : 0.035);
    if (keyboard.pressed('left')) {
        direction = HORSE_DIRECTION.LEFT;
        callTick(lastKeyPressed !== 'left');
        horseScene.rotation.y += speed;
        lastKeyPressed = 'left';
    }
    if (keyboard.pressed('right')) {
        direction = HORSE_DIRECTION.RIGHT;
        callTick(lastKeyPressed !== 'right');
        horseScene.rotation.y -= speed;
        lastKeyPressed = 'right';
    }
    if(keyboard.pressed('up')) {
        direction = HORSE_DIRECTION.CENTER;
        callTick(lastKeyPressed !== 'up');
        horseScene.translateZ(speed * 10);
        lastKeyPressed = 'up';
    }
    if(keyboard.pressed('down')) {
        direction = HORSE_DIRECTION.CENTER;
        callTick(lastKeyPressed !== 'down');
        horseScene.translateZ(-speed * 10);
        lastKeyPressed = 'down';
    }
    if(keyboard.pressed('w')) {
        gait = GAIT.WALK;
    }
    if(keyboard.pressed('c')) {
        gait = GAIT.CANTER;
    }
    if(keyboard.pressed('t')) {
        gait = GAIT.TROT;
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

function createMixers(gltf) {
    let horseScene = gltf.scene;
    let mixers = []
    let saddle = horseScene.children[4];
    let horse = horseScene.children[3];
    let denise = horseScene.children[2];

    // add canter animations
    let saddle_canter = addAnimation(gltf.animations[0], saddle);
    let denise_canter = addAnimation(gltf.animations[12], denise);
    let horse_canter = addAnimation(gltf.animations[3], horse);
    let horse_canter_L = addAnimation(gltf.animations[4], horse);
    let horse_canter_R = addAnimation(gltf.animations[5], horse);
    mixers.push([saddle_canter, denise_canter, horse_canter, horse_canter_L, horse_canter_R]);

    // add trot animations
    let saddle_trot = addAnimation(gltf.animations[1], saddle);
    let denise_trot = addAnimation(gltf.animations[13], denise);
    let horse_trot = addAnimation(gltf.animations[6], horse);
    let horse_trot_L = addAnimation(gltf.animations[7], horse);
    let horse_trot_R = addAnimation(gltf.animations[8], horse);
    mixers.push([saddle_trot, denise_trot, horse_trot, horse_trot_L, horse_trot_R]);

    // add walk animations
    let saddle_walk = addAnimation(gltf.animations[2], saddle);
    let denise_walk = addAnimation(gltf.animations[14], denise);
    let horse_walk = addAnimation(gltf.animations[9], horse);
    let horse_walk_L = addAnimation(gltf.animations[10], horse);
    let horse_walk_R = addAnimation(gltf.animations[11], horse);
    mixers.push([saddle_walk, denise_walk, horse_walk, horse_walk_L, horse_walk_R]);

    return mixers;
}

function addAnimation(animation, model) {
    let mixer = new THREE.AnimationMixer(model);
    let action = mixer.clipAction(animation);
    action.play();
    return mixer;
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