import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import {
    SceneLoader,
    Scene,
    FreeCamera,
    HemisphericLight,
    Vector3
} from "@babylonjs/core"

// Основная игровая сцена
export class GameScene extends Scene {
    _view: HTMLCanvasElement;

    constructor(engine, view) {
        super(engine)

        this._view = view
    }

    async enter(): Promise<void> {
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this);

        const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this
        );

        meshes.map((mesh) => {
            mesh.checkCollisions = true;
        });

        const framesPerSecond = 60;
        const gravity = -9.81;
        this.gravity = new Vector3(0, gravity / framesPerSecond, 0);
        this.collisionsEnabled = true;

        const camera = new FreeCamera("camera", new Vector3(0, 10, 0), this);
        camera.attachControl();

        camera.applyGravity = true;
        camera.checkCollisions = true;

        camera.ellipsoid = new Vector3(1, 1, 1);

        camera.minZ = 0.45;
        camera.speed = 0.25;
        camera.angularSensibility = 8000;

        this.onPointerDown = (evt) => {
            if (evt.button === 0) this.getEngine().enterPointerlock();
            if (evt.button === 1) this.getEngine().exitPointerlock();
        };

        camera.keysUp.push(87);
        camera.keysLeft.push(65);
        camera.keysDown.push(83);
        camera.keysRight.push(68);
    }
}