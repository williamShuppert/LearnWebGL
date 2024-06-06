import { mouseSensitivity, setMouseSensitivity } from "./main.js"

const sensitivityInput = document.getElementById("mouse-sensitivity-input")
const sensitivitySlider = document.getElementById("mouse-sensitivity-slider")

setMouseSensitivity(localStorage.getItem("mouseSensitivity") || mouseSensitivity)
sensitivityInput.value = mouseSensitivity
sensitivitySlider.value = mouseSensitivity

sensitivitySlider.addEventListener('input', e => {
    localStorage.setItem("mouseSensitivity", e.target.value)
    sensitivityInput.value = e.target.value
    setMouseSensitivity(e.target.value)
})
sensitivityInput.addEventListener('input', e => {
    localStorage.setItem("mouseSensitivity", e.target.value)
    sensitivitySlider.value = e.target.value
    setMouseSensitivity(e.target.value)
})



import { moveSpeed, setMoveSpeed } from "./main.js"

const moveSpeedSlider = document.getElementById("move-speed-input")
const moveSpeedInput = document.getElementById("move-speed-slider")

setMoveSpeed(localStorage.getItem("moveSpeed") || moveSpeed)
moveSpeedSlider.value = moveSpeed
moveSpeedInput.value = moveSpeed

moveSpeedInput.addEventListener('input', e => {
    localStorage.setItem("moveSpeed", e.target.value)
    moveSpeedSlider.value = e.target.value
    setMoveSpeed(e.target.value)
})
moveSpeedSlider.addEventListener('input', e => {
    localStorage.setItem("moveSpeed", e.target.value)
    moveSpeedInput.value = e.target.value
    setMoveSpeed(e.target.value)
})