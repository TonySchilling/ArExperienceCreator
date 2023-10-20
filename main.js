import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from 'tween';


let currentObjects = [];
let mixer;
let previousObject;
let previousMaterial;

let poopObject;
const currentModels = [];
const scene = new THREE.Scene();

const canvasContainer = document.getElementById("canvas-container");
const containerWidth = canvasContainer.clientWidth;
const containerHeight = canvasContainer.clientHeight;

const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);

const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#canvas'),
  alpha:true,
  antialias: false
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( containerWidth , containerHeight );
camera.position.setZ(5);
camera.position.setY(5);
camera.rotation.set(Math.PI / -5, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);


const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(0,5,0);
pointLight.intensity = 50;
scene.add(pointLight);
const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);


const gltfLoader = new GLTFLoader();

gltfLoader.load('./assets/blackBackground2.glb', (gltfScene) => {
  const model = gltfScene.scene;
  // speeder.scale.set(5,5,5);
  // speeder.position.y = -4;
  // scene.add(model);
  // console.log(speeder);
});


// Add the plane to the scene
// scene.add(plane);


const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const lineGeometry = new THREE.BufferGeometry();
const lineVertices = new Float32Array([0, 0, 0, 0, 0, -1]); // A line from origin to -Z direction
lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));

const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

function createRaycaster(event, camera) {
  const raycaster = new THREE.Raycaster();
  // const mouse = new THREE.Vector2();
  // const containerWidth1 = canvasContainer.clientWidth;
  // const containerHeight1 = canvasContainer.clientHeight;
  // mouse.x = (event.clientX / containerWidth1) * 2 - 1;
  // mouse.y = -(event.clientY / containerHeight1) * 2 + 1;

  const canvasRect = canvasContainer.getBoundingClientRect();
  const offsetX = canvasRect.left;
  const offsetY = canvasRect.top;

  // Calculate mouse coordinates relative to the canvas container.
  const mouseX = (event.clientX - offsetX) / containerWidth;
  const mouseY = (event.clientY - offsetY) / containerHeight;

  // Transform mouse coordinates to NDC space.
  const mouse = new THREE.Vector2();
  mouse.x = (mouseX * 2 - 1);
  mouse.y = -(mouseY * 2 - 1);

  raycaster.setFromCamera(mouse, camera);
  line.geometry.attributes.position.setXYZ(1, raycaster.ray.direction.x * 100, raycaster.ray.direction.y * 100, raycaster.ray.direction.z * 100);
  line.geometry.attributes.position.needsUpdate = true;


  return raycaster;

}

const selectedMaterial = new THREE.MeshStandardMaterial({ color: 0x09edc7, emissive: 0x09edc7, emissiveIntensity: 5});

function setSelectedObject(obj) {
  if (previousObject) {
    previousObject.material = previousMaterial;
  }
  const selectedObject = obj;
  previousObject = selectedObject;
  previousMaterial = selectedObject.material;
  selectedObject.material = selectedMaterial;

}

canvas.addEventListener("click", (event) => {
  console.log(event);
  const raycaster = createRaycaster(event, camera);
  const intersection = raycaster.intersectObjects(currentObjects);

  if (intersection.length >0) {
    const selectedObject = intersection[0].object;
    poopObject = selectedObject;
    console.log(selectedObject);
    setSelectedObject(selectedObject);
    // if (previousObject) {
    //   previousObject.material = previousMaterial;
    // }
    // const selectedObject = intersection[0].object;
    // previousObject = selectedObject;
    // previousMaterial = selectedObject.material;
    // selectedObject.material = selectedMaterial;
    // clearContents(["components-detail"]);

    removeClasslist("components-detail", "detail-item", "selected");
    const elementId = `component_detailItem_${selectedObject.name}`;
    console.log("elementId", elementId);
    const detailItem = document.getElementById(elementId);
    detailItem.classList.add("selected");

  }

})

function clearScene() {
  currentModels.forEach(model => {
    scene.remove(model);
  })

  currentModels.length = 0;
}


function addAnimationDetail(gltf, parent, animationName) {

  console.log(animationName);
  console.log(mixer);

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn");
  button.classList.add("btn-seconday");
  button.textContent = "PLAY";
  button.dataset.clicked = "false";
  button.dataset.test = "wefwefwe";
  parent.appendChild(button);

  button.addEventListener("click", () =>{
    console.log(button.dataset);
    const clip = THREE.AnimationClip.findByName(gltf.animations, animationName);
    const action = mixer.clipAction(clip);
    if (button.dataset.clicked === "true") {
      console.log("first");
      button.textContent = "PLAY";
      button.dataset.clicked = "false";
      action.stop();
    } else {
      console.log("second");
      button.textContent = "STOP";
      button.dataset.clicked = "true";
      action.play();
    }


  })

}

function addComponentDetail(gltf, parent, componentName) {

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn");
  button.classList.add("btn-seconday");
  button.textContent = "HIDE";
  button.dataset.clicked = "false";
  parent.appendChild(button);

  button.addEventListener("click", () =>{
    const component = gltf.scene.getObjectByName(componentName);

    if (button.dataset.clicked === "true") {
      button.textContent = "HIDE";
      button.dataset.clicked = "false";
      component.visible = true;
      console.log(component);
      // gltf.scene.visible = false;
      // component.parent.remove(component);
    } else {
      // console.log(component.visibile);
      button.textContent = "SHOW";
      button.dataset.clicked = "true";
      component.visible = false;
      console.log(component);
    }


  })

}

function removeClasslist(parentID, childClassName, className) {
  const parentContainer = document.getElementById(parentID);
  const children = parentContainer.getElementsByClassName(childClassName);
  // console.log(children.length);
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    childNode.classList.remove(className);

}

}

function addDetailItem(gltf, parentID, name, detailType) {
  const parent = document.getElementById(parentID);

  const detailItem = document.createElement("div");
  detailItem.classList.add("detail-item");
  detailItem.id = `${detailType}_detailItem_${name}`;
  const title = document.createElement("p");
  title.textContent = name;
  detailItem.appendChild(title);
  parent.appendChild(detailItem);


  detailItem.addEventListener("click", (event) => {
    removeClasslist(parentID, "detail-item", "selected");
  //   const parentContainer = document.getElementById(parentID);
  //   const children = parentContainer.getElementsByClassName("detail-item");
  //   // console.log(children.length);
  //   for (let i = 0; i < children.length; i++) {
  //     const childNode = children[i];
  //     childNode.classList.remove("selected");

  // }

    detailItem.classList.add("selected");
    console.log("clicked");
    if (detailType === "component") {
      currentObjects.forEach(object => {
        if (object.name === name) {
          setSelectedObject(object);
          
        }
      })
  
    }

  })

  if (detailType === "animation") {
    console.log("Doing animation");
    addAnimationDetail(gltf, detailItem, name);

  }

  if (detailType === "component") {
    console.log("Doing component");
    addComponentDetail(gltf, detailItem, name);

  }
}

function clearContents(elementIDs) {

  elementIDs.forEach(ID => {
    const element = document.getElementById(ID);
    element.innerHTML = "";
  })
}

function getModelData(gltf) {
  clearContents(["animations-detail","components-detail"]);
  gltf.animations.forEach(animation => {
    addDetailItem(gltf, "animations-detail", animation.name, "animation");

  })

  
  gltf.scene.traverse((object) => {
    addDetailItem(gltf, "components-detail", object.name, "component");

  })

  // gltf.scene.children.forEach(child => {
  //   addDetailItem(gltf, "components-detail", child.name, "component");

  // })
}

// const gltfLoader = new GLTFLoader();
const importButton = document.getElementById("import-button");
importButton.addEventListener("click", openFileExplorer, false);

function openFileExplorer() {
  const modelInput = document.getElementById("modelInput");

  // Trigger a click event on the hidden input element
  modelInput.click();

  // Handle the selected file
  modelInput.addEventListener("change", handleFileSelect, false);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  
  // Do something with the selected file (e.g., load it into Three.js)
  if (file) {
    clearScene();
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        // Parse the 3D model data using the appropriate loader (FBXLoader, STLLoader, GLTFLoader, etc.)
        // For example, using Three.js GLTFLoader:
        const loader = new GLTFLoader();
        loader.parse(contents, "", function (gltf) {
            // The loaded 3D model is in 'gltf' variable
            // Add the model to your Three.js scene
            const model = gltf.scene;
            scene.add(model);
            currentModels.push(model);
            console.log(gltf);
            mixer = new THREE.AnimationMixer(gltf.scene);
            getModelData(gltf);
            currentObjects = [];
            gltf.scene.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                console.log(object.name);
                  currentObjects.push(object)
                  
              }
          })

            
            
        });
    };
      // Read the uploaded file as text (binary formats like FBX need different handling)
      reader.readAsArrayBuffer(file);
  }
}


//NestedStuff
function getNestedProperty(obj, path) {
  const properties = path.split('.');
  return properties.reduce((acc, property) => acc[property], obj);
}

function setNestedProperty(obj, path, value) {
  const properties = path.split('.');
  const lastProperty = properties.pop();
  const nestedObject = properties.reduce((acc, property) => acc[property], obj);
  nestedObject[lastProperty] = value;
}

function tweenPropertyAnimation(object, property, start, end, duration) {
  const initialPropertyValue = getNestedProperty(object, property);
  
  const tween = new TWEEN.Tween({ value: initialPropertyValue })
      .to({ value: end }, duration)
      .onUpdate(function () {
          setNestedProperty(object, property, this.value);
      })
      .start();
}


let poopPhoto;
const textureLoader = new THREE.TextureLoader();
poopPhoto = textureLoader.load('./assets/objAlpha.png');
console.log(poopPhoto);


function tweenMaterialAnimation(object, beginning, end, time) {
  const tween = new TWEEN.Tween({ offset: beginning })
  .to({ offset: end }, time)
  .onUpdate(function () {
    object.material.alphaMap.offset.y = this.offset;
    object.material.needsUpdate = true;
  })

  .start(); // Start the animation

}

const testButton1 = document.getElementById("testing-button1");
const testButton2 = document.getElementById("testing-button2");

testButton1.addEventListener("click", () => {
  if (penisModel) {

    penisModel.material.alphaMap = poopPhoto;
    penisModel.material.alphaMap.offset.y = 1;
    // penisModel.material.map.repeat.y = 5;
    // penisModel.material.map.rotation = -.2;
    // penisModel.material.transparent = true;
    // penisModel.material.map.offset.y = -.5;

    // const maps = ['map', 'roughnessMap', 'normalMap'];
    // setNestedProperty(penisModel, "material.map.repeat.y", 5);
    // setNestedProperty(penisModel, "material.map.repeat.x", 5);
    // setNestedProperty(penisModel, "material.roughnessMap.repeat.y", 5);
    // setNestedProperty(penisModel, "material.roughnessMap.repeat.x", 5);
    // setNestedProperty(penisModel, "material.normalMap.repeat.y", 5);
    // setNestedProperty(penisModel, "material.normalMap.repeat.x", 5);
    console.log(penisModel);
    penisModel.material.needsUpdate = true;

    // maps.forEach(map => {
    //   const repeat = 5;
    //   penisModel.material[map].repeat.x = repeat;
    //   penisModel.material[map].repeat.y = repeat;
    // })

  }
})

testButton2.addEventListener("click", () => {
  
  if (penisModel) {

    // tweenMaterialAnimation(penisModel, -.5, 1, 10000);
    penisModel.material.alphaMap.offset.y = -.35;
    tweenPropertyAnimation(penisModel, "material.alphaMap.offset.y", .5,1, 14500);
    // tweenPropertyAnimation(penisModel, "scale.x", 1,5, 1450);
    // tweenPropertyAnimation(penisModel, "scale.y", 1,5, 1450);
    // tweenPropertyAnimation(penisModel, "scale.z", 1,5, 1400);
    mixer = new THREE.AnimationMixer(penisGltf.scene);
    console.log(penisGltf.animations);
    const animNames = ["cablePrint1", "FilamentExtruderPrint1", "filExtruderPrint1", "yAxisPrint1", "xAxisPrint1", "zAxisActionPrint1"]

    animNames.forEach(name => {
      console.log(name);
      const clip = THREE.AnimationClip.findByName(penisGltf.animations, name);
      const action = mixer.clipAction(clip);
      // action.timeScale = .5;
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

    })

  }
})


let penisModel;
let penisGltf;
gltfLoader.load('./assets/3dPrinter.glb', (gltfScene) => {
  const model = gltfScene.scene;
  model.rotation.y = -Math.PI/2

  scene.add(model);
  console.log(model);
  penisGltf = gltfScene;
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {

      
        if (object.name === "Print2") {
          console.log(object.name);
            penisModel = object;
            console.log(object);
        }
        if (object.name === "Print1") {
          object.visible = false;
        }
    }
});  
  // console.log(speeder);
});






const clock = new THREE.Clock();

function animate() {
  TWEEN.update(); 
  // composer.render();
  requestAnimationFrame( animate );
  const clockValue = clock.getDelta();
  if (mixer) {
    mixer.update(clockValue);
}

  controls.update();
  // composer.render();
  renderer.render(scene, camera);
}

animate();