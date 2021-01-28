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
let speed;
let lastKeyPressed;

let horseScene;
let helper;
let boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

gltfLoader.load( './assets/deniseHorse.glb', function ( gltf ) {
    horseScene = gltf.scene;
    console.log(horseScene);
    let mixers = createMixers(gltf);

    horseScene.tick = (delta) => {
        let gait_num = gait === GAIT.CANTER ? 0 : (gait === GAIT.WALK ? 2 : 1);
        for (let i = 0; i < 5; i++) {
            if (i < 2 || i === direction) {
                mixers[gait_num][i].update(delta);
            }
        }
        boundingBox.setFromObject(horseScene);
        if (!boundingBox.isIntersectionBox(world.getArena().getBoundingBox())) {
            switch (lastKeyPressed) {
                case "up":
                    horseScene.translateZ(-speed * 10);
                    break;
                case "down":
                    horseScene.translateZ(speed * 10);
                    break;
                case "left":
                    horse.rotation.y -= speed;
                    break;
                case "right":
                    horse.rotation.y += speed;
                    break;
                default:
                    break;
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
    boundingBox.setFromObject(horseScene);


}, undefined, function ( error ) {
	console.error( error );
} );

// const lightHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(lightHelper);
  

const loader = new THREE.FontLoader();

loader.load( '/fonts/helvetiker_regular.typeface.json', function ( font ) {

	const c_letter = new THREE.TextGeometry( 'C', {
		font: font,
		size: 8,
		height: 0.2,
    } );

    const a_letter = new THREE.TextGeometry( 'A', {
		font: font,
		size: 8,
		height: 0.2,
    } );

    const e_letter = new THREE.TextGeometry( 'E', {
		font: font,
		size: 8,
		height: 0.2,
    } );

    const b_letter = new THREE.TextGeometry( 'B', {
		font: font,
		size: 8,
		height: 0.2,
    } );
    const f_letter = new THREE.TextGeometry( 'F', {
		font: font,
		size: 8,
		height: 0.2,
    } );
    const k_letter = new THREE.TextGeometry( 'K', {
		font: font,
		size: 8,
		height: 0.2,
    } );
    const h_letter = new THREE.TextGeometry( 'H', {
		font: font,
		size: 8,
		height: 0.2,
    } );
    const m_letter = new THREE.TextGeometry( 'M', {
		font: font,
		size: 8,
		height: 0.2,
    } );

    var textMaterial = new THREE.MeshPhongMaterial( 
        { color: 0xffffff, specular: 0xffffff }
      );
    
      var c_mesh = new THREE.Mesh(c_letter, textMaterial );
      var a_mesh = new THREE.Mesh(a_letter, textMaterial );
      var e_mesh = new THREE.Mesh(e_letter, textMaterial );
      var b_mesh = new THREE.Mesh(b_letter, textMaterial );
      var f_mesh = new THREE.Mesh(f_letter, textMaterial );
      var k_mesh = new THREE.Mesh(k_letter, textMaterial );
      var h_mesh = new THREE.Mesh(h_letter, textMaterial );
      var m_mesh = new THREE.Mesh(m_letter, textMaterial );

      e_mesh.rotation.y = Math.PI/2;
      b_mesh.rotation.y = -Math.PI/2;
      f_mesh.rotation.y = -Math.PI/2;
      k_mesh.rotation.y = Math.PI/2;
      h_mesh.rotation.y = Math.PI/2;
      m_mesh.rotation.y = -Math.PI/2;
      c_mesh.position.set(0,5,-105);
      a_mesh.position.set(0,5,105);
      e_mesh.position.set(-55,5,0);
      b_mesh.position.set(50,5,0);
      f_mesh.position.set(50,5,50);
      k_mesh.position.set(-55,5,50);
      h_mesh.position.set(-55,5,-50);
      m_mesh.position.set(50,5,-50);
    
    world.getScene().add(c_mesh);
    world.getScene().add(a_mesh);
    world.getScene().add(e_mesh);
    world.getScene().add(b_mesh);
    world.getScene().add(f_mesh);
    world.getScene().add(k_mesh);
    world.getScene().add(h_mesh);
    world.getScene().add(m_mesh);

} );

// Functions
var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
    speed = gait === GAIT.WALK ? 0.025 : (gait === GAIT.CANTER ? 0.07 : 0.04);
    let rotation_speed = gait === GAIT.WALK ? 0.02 : 0.04;
    if(keyboard.pressed('up')) {
        direction = HORSE_DIRECTION.CENTER;
        horseScene.translateZ(speed * 10);
        if (keyboard.pressed('left')) {
            direction = HORSE_DIRECTION.LEFT;
            callTick(lastKeyPressed !== 'left');
            horseScene.rotation.y += rotation_speed*0.7;
            lastKeyPressed = 'left';
        } else if (keyboard.pressed('right')) {
            direction = HORSE_DIRECTION.RIGHT;
            callTick(lastKeyPressed !== 'right');
            horseScene.rotation.y -= rotation_speed*0.7;
            lastKeyPressed = 'right';
        } else {
            callTick(lastKeyPressed !== 'up');
            lastKeyPressed = 'up';
        }
    } else if (keyboard.pressed('left')) {
        direction = HORSE_DIRECTION.LEFT;
        callTick(lastKeyPressed !== 'left');
        horseScene.rotation.y += rotation_speed;
        lastKeyPressed = 'left';
    } else if (keyboard.pressed('right')) {
        direction = HORSE_DIRECTION.RIGHT;
        callTick(lastKeyPressed !== 'right');
        horseScene.rotation.y -= rotation_speed;
        lastKeyPressed = 'right';
    } else if(keyboard.pressed('down')) {
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

    if(keyboard.pressed('r')) {
        //reset position
        horseScene.position.set(0,0,0);
        horseScene.rotation.set(0,0,0);

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
    let saddle = horseScene.children[3];
    let horse = horseScene.children[2];
    let denise = horseScene.children[1];

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
    // helper.update(boundingBox)
    world.render();
}

window.addEventListener('resize', world.onWindowResize, false);
animate();