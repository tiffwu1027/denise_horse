import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
import Arena from './arena.js';

let scene, renderer, camera, cameraControl;

export default class World {
    constructor(container) {
        scene = new THREE.Scene();
        camera = this.createCamera();
        renderer = this.createRenderer();
        cameraControl = this.createCameraControls();
        this.createLights();

        const arena = new Arena();
        scene.add(arena);
        container.append(renderer.domElement);
    }

    render() {
        renderer.render(scene, camera);
    }

    createCamera() {
        let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000); // view angle, aspect ratio, near, far
        camera.position.set(0,30,60);
        camera.lookAt(scene.position);
        scene.add(camera);
        return camera;
    }

    createRenderer() {
        let renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;

        return renderer;
    }

    createCameraControls() {
        // Camera controls
        let cameraControl = new OrbitControls(camera, renderer.domElement);
        cameraControl.damping = 0.2;
        cameraControl.autoRotate = false;

        return cameraControl;
    }

    createLights() {
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8);
        directionalLight.position.set(20.0,20.0,20.0);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.zoom=0.7;
        scene.add(directionalLight);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
    }

    onWindowResize() {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getRenderer() {
        return renderer;
    }

    getCamera() {
        return camera;
    }

    getScene() {
        return scene;
    }
}

export {World};