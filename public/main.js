import * as THREE from '/build/three.module.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
import World from './world.js';


let HORSE_DIRECTION = {
    CENTER: 2,
    LEFT: 3,
    RIGHT: 4
};

let GAIT = {
    WALK: 'walk',
    TROT: 'trot',
    CANTER: 'canter'
};
const container = document.querySelector('#scene-container');

const world = new World(container);
// define some essential variables:
let gltfLoader;

gltfLoader = new GLTFLoader();

const clock = new THREE.Clock();
let direction = HORSE_DIRECTION.LEFT;
let gait = GAIT.WALK;
let horseScene;
gltfLoader.load( './assets/deniseHorse.glb', function ( gltf ) {
    horseScene = gltf.scene;
    let mixers = createMixers(gltf);

    horseScene.tick = (delta) => {
        let gait_num = gait === GAIT.CANTER ? 0 : (gait === GAIT.WALK ? 2 : 1);
        for (let i = 0; i < 5; i++) {
            if (i < 2 || i === direction) {
                mixers[gait_num][i].update(delta);
            }
        }
    }

    horseScene.setTime = (delta) => {
        let gait_num = gait === GAIT.CANTER ? 0 : (gait === GAIT.WALK ? 2 : 1);
        for (let i = 0; i < 5; i++) {
            if (i < 2 || i === direction) {
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
    world.getScene().add(horseScene);
    let boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    boundingBox.setFromObject(horseScene);
    let helper = new THREE.Box3Helper(boundingBox, 0xffff00);
    world.getScene().add(helper);

}, undefined, function ( error ) {
	console.error( error );
} );

// const lightHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(lightHelper);
  

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
function animate() {
    requestAnimationFrame(animate);
    checkKeyboard();
    world.render();
}

window.addEventListener('resize', world.onWindowResize, false);
animate();