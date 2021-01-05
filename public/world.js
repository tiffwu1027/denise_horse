import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';

let scene, renderer, camera;

class World {
    constructor(container) {
        scene = new THREE.Scene();
        camera = this.createCamera();
        renderer = this.createRenderer();
        container.append(renderer.domElement);
    }

    render() {
        renderer.render(scene, camera);
    }

    createCamera() {
        let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000); // view angle, aspect ratio, near, far
        camera.position.set(0,15,30);
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
}

export {World};