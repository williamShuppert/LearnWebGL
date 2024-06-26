import { mouseSensitivity, setMouseSensitivity } from "./main.js"

const sensitivityInput = document.getElementById("mouse-sensitivity-input")
const sensitivitySlider = document.getElementById("mouse-sensitivity-slider")

setMouseSensitivity(localStorage.getItem("mouseSensitivity") || mouseSensitivity)
sensitivityInput.value = mouseSensitivity
sensitivitySlider.value = mouseSensitivity

sensitivitySlider.addEventListener('input', e => {
    localStorage.setItem("mouseSensitivity", e.target.value)
    sensitivityInput.value = setMouseSensitivity(e.target.value)
})
sensitivityInput.addEventListener('input', e => {
    localStorage.setItem("mouseSensitivity", e.target.value)
    sensitivitySlider.value = setMouseSensitivity(e.target.value)
})



import { moveSpeed, setMoveSpeed } from "./main.js"

const moveSpeedSlider = document.getElementById("move-speed-input")
const moveSpeedInput = document.getElementById("move-speed-slider")

setMoveSpeed(localStorage.getItem("moveSpeed") || moveSpeed)
moveSpeedSlider.value = moveSpeed
moveSpeedInput.value = moveSpeed

moveSpeedInput.addEventListener('input', e => {
    localStorage.setItem("moveSpeed", e.target.value)
    moveSpeedSlider.value = setMoveSpeed(e.target.value)
})
moveSpeedSlider.addEventListener('input', e => {
    localStorage.setItem("moveSpeed", e.target.value)
    moveSpeedInput.value = setMoveSpeed(e.target.value)
})



import { setCanvasFocus } from "./main.js"

const focusOverlay = document.getElementById("focus-overlay")
focusOverlay.addEventListener("click", e => {
    setCanvasFocus().then(e => {
        focusOverlay.style.opacity = "0%"
    })
})
document.addEventListener('pointerlockchange', e => {
    if (document.pointerLockElement) {
        focusOverlay.style.opacity = "0%"
    } else {
        focusOverlay.style.opacity = "100%"
    }
})

import { vec3 } from "../shared/glmatrix/next/index.js"
import { hexToRgb, rgbToHex } from "../shared/random.js"
import { setAmbient, setDiffuse, setSpecular, lightAmbient, lightDiffuse, lightSpecular, clearColor, setClearColor } from "./main.js"

const ambientInput = document.getElementById("ambient-input")
const diffuseInput = document.getElementById("diffuse-input")
const specularInput = document.getElementById("specular-input")
const clearInput = document.getElementById("clear-input")

ambientInput.value = rgbToHex(...vec3.scale(new vec3(), lightAmbient, 255))
diffuseInput.value = rgbToHex(...vec3.scale(new vec3(), lightDiffuse, 255))
specularInput.value = rgbToHex(...vec3.scale(new vec3(), lightSpecular, 255))
clearInput.value = rgbToHex(...vec3.scale(new vec3(), clearColor, 255))

ambientInput.addEventListener('input', e => {
    setAmbient(hexToRgb(e.target.value))
})
diffuseInput.addEventListener('input', e => {
    setDiffuse(hexToRgb(e.target.value))
})
specularInput.addEventListener('input', e => {
    setSpecular(hexToRgb(e.target.value))
})
clearInput.addEventListener('input', e => {
    setClearColor(hexToRgb(e.target.value))
})