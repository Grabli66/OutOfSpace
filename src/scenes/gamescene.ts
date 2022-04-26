import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import {
    SceneLoader,
    Scene,
    Sound,
    KeyboardEventTypes,
    TransformNode,
    MeshBuilder,
    ArcRotateCamera,
    SpotLight,
    Vector3,
    Color3,
    Color4,
    Axis,
    Space,
    Angle
} from "@babylonjs/core"

import { CharacterController } from "../CharacterController"

// Основная игровая сцена
export class GameScene extends Scene {
    _view: HTMLCanvasElement;

    constructor(engine, view) {
        super(engine)

        this._view = view
    }

    async enter(): Promise<void> {
        this.onPointerDown = (evt) => {
            if (evt.button === 0) this.getEngine().enterPointerlock();
            if (evt.button === 1) this.getEngine().exitPointerlock();
        };

        // var music = new Sound("Music", "./music/track1.mp3", this, null, {
        //     loop: true,
        //     autoplay: true
        // });

        var clickSound = new Sound("ClickSound", "./sound/click.wav", this, null, {});


        this.ambientColor = Color3.Black()
        this.clearColor = new Color4(0, 0, 0)

        let light = new SpotLight("spot", new Vector3(0, 1, 0), new Vector3(1, 0, 0), Angle.FromDegrees(45).radians(), 60, this)
        light.intensity = 500

        let result = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "flashlight.glb",
            this
        )

        let lightMesh = result.meshes[0]

        result = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this
        );

        result.meshes.map((mesh) => {
            mesh.checkCollisions = true;
        });

        let player = MeshBuilder.CreateCapsule("capsule", {
            height: 3, radius: 1
        }, this)

        player.position.x = 8
        player.position.y = 4

        player.ellipsoid = new Vector3(1.5, 1, 1.5);

        var alpha = (3 * Math.PI) / 2 - player.rotation.y;
        var beta = Math.PI / 2.5;
        var target = new Vector3(player.position.x, player.position.y + 1.5, player.position.z);
        var camera = new ArcRotateCamera("ArcRotateCamera", alpha, beta, 1, target, this);
        camera.angularSensibilityX = 4000
        camera.angularSensibilityY = 4000
        camera.minZ = 0.6

        camera.keysLeft = [];
        camera.keysRight = [];
        camera.keysUp = [];
        camera.keysDown = [];

        camera.wheelPrecision = 0;
        camera.checkCollisions = false;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 20;
        camera.attachControl(this._view, false);

        lightMesh.scaling.set(0.6, 0.6, 0.6)
        lightMesh.rotate(Axis.Y, Angle.FromDegrees(-95).radians(), Space.LOCAL)
        let transformNode = new TransformNode("transformNode")
        transformNode.parent = camera;
        transformNode.scaling = new Vector3(0.15, 0.15, 0.15);
        transformNode.position = new Vector3(0.4, -0.45, 1.25);
        lightMesh.parent = transformNode

        let cc = new CharacterController(player, camera, this, null, true);

        cc.setMode(0);
        //below makes the controller point the camera at the player head which is approx
        //1.5m above the player origin
        cc.setCameraTarget(new Vector3(0, 1.5, 0));

        //if the camera comes close to the player then we want cc to enter first person mode.
        cc.setNoFirstPerson(false);
        //the height of steps which the player can climb
        cc.setStepOffset(0.4);
        //the minimum and maximum slope the player can go up
        //between the two the player will start sliding down if it stops
        cc.setSlopeLimit(30, 60);

        cc.start();

        this.onBeforeRenderObservable.add(() => {
            light.position = camera.position
            light.setDirectionToTarget(camera.getFrontPosition(1))
        })

        this.onKeyboardObservable.add((ed) => {
            if (ed.event.code == "KeyF") {
                switch (ed.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        clickSound.play()
                        light.setEnabled(!light.isEnabled())
                }
            }
        });
    }
}