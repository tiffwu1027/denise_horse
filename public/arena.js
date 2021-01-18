import * as THREE from '/build/three.module.js';

let texture, material, geometry, plane;

export default class Arena extends THREE.Group {
    constructor() {
        super();
        texture = this.createTexture();
        material = new THREE.MeshBasicMaterial( { map: texture } );
        geometry = new THREE.PlaneGeometry( 100, 200, 32 );
        plane = this.createPlane();
        this.add(plane);
    }

    createTexture() {
        let texture = new THREE.TextureLoader().load( 'img/sand.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4,4);

        return texture;
    }

    createPlane() {
        plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.rotation.set(- Math.PI / 2, 0, 0);

        return plane;
    }
}