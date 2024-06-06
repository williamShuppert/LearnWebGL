import { mouseSensitivity, setMouseSensitivity } from "./main.js"

const sensitivityInput = document.getElementById("mouse-sensitivity-input")
const sensitivitySlider = document.getElementById("mouse-sensitivity-slider")

setMouseSensitivity(localStorage.getItem("mouseSensitivity") || .1)
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



