import * as THREE from '/build/three.module.js';

let texture, material, geometry, plane, boundingBox, innerPlane;

export default class Arena extends THREE.Group {
    constructor() {
        super();
        texture = this.createTexture();
        material = new THREE.MeshBasicMaterial( { map: texture } );
        geometry = new THREE.PlaneGeometry( 100, 200, 32 );
        let inner_geometry = new THREE.PlaneGeometry( 80, 180, 32 );
        plane = this.createPlane(geometry);
        innerPlane = this.createPlane(inner_geometry);
        this.addBoundingBox(innerPlane);
        this.add(innerPlane)
        this.add(plane);
    }

    createTexture() {
        let texture = new THREE.TextureLoader().load( 'img/sand.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4,4);

        return texture;
    }

    createPlane(plane_geometry) {
        let new_plane = new THREE.Mesh(plane_geometry, material);
        new_plane.receiveShadow = true;
        new_plane.rotation.set(- Math.PI / 2, 0, 0);
        return new_plane;
    }

    addBoundingBox(plane_to_bound) {
        boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        boundingBox.setFromObject(plane_to_bound);
    }

    getBoundingBox() {
        return boundingBox;
    }
}