// Referencing material from https://learnopengl.com/Introduction
// capture screen shots at 550x309

import { fullScreenCanvas } from "../shared/canvas-helpers.js"
import { toRadian } from "../shared/glmatrix/next/common.js"
import { vec3, mat4 } from "../shared/glmatrix/next/index.js"
import { getRainbowColor } from "../shared/random.js"

const radians = toRadian

// Settings
let fov = 75
export let mouseSensitivity = .1
export let moveSpeed = 5
const aspectRatio = 16/9.
const clearColor = [.2, .3, .3, 1]
const fpsInterval = 500 // How often to calculate FPS, in milliseconds
const maxFpsSamples = 5 // Number of FPS samples
const zNear = .05
const zFar = 100

async function main() {
    const canvas = document.getElementById('gl')
    const gl = canvas.getContext('webgl2')
    
    if (!gl) {
        prompt("WebGL2 is not supported by your browser.")
        return
    }
    
    // FPS data
    let frameCount = 0
    let fps = 0
    const fpsArray = []
    let accumulatedTime = 0
    const fpsDisplay = document.getElementById('fps-display')
    const keysPressed = {}

    // General data
    let deltaTime = 0
    let lastTime = 0
    let up = new vec3(0, 1, 0)
    
    // Camera transform data
    let cameraPos = new vec3(0, 0, 3)
    let cameraForward = new vec3(0, 0, -1)
    let cameraRight = vec3.cross(vec3.create(), cameraForward, up)
    let cameraUp = vec3.cross(vec3.create(), cameraRight, cameraForward)
    let yaw = -90, pitch = 0

    let img = new Image()
    await loadImage(img, "../shared/container.jpg")

    const vertices = [
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
         0.5, -0.5, -0.5,  0.0,  0.0, -1.0, 
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0, 
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0, 
        -0.5,  0.5, -0.5,  0.0,  0.0, -1.0, 
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0, 
    
        -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,
         0.5, -0.5,  0.5,  0.0,  0.0, 1.0,
         0.5,  0.5,  0.5,  0.0,  0.0, 1.0,
         0.5,  0.5,  0.5,  0.0,  0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,
    
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
        -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
        -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
    
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
         0.5,  0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
         0.5, -0.5,  0.5,  1.0,  0.0,  0.0,
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
    
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
         0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
    
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
        -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0
    ]
    
    let cubePositions = [
        [0.0,  0.0,  -5.0],
        [2.0,  5.0, -15.0],
        [-1.5, -2.2, -2.5],
        [-3.8, -2.0, -12.3],
        [2.4, -0.4, -3.5],
        [-1.7,  3.0, -7.5],
        [1.3, -2.0, -2.5],
        [1.5,  2.0, -2.5],
        [1.5,  0.2, -1.5],
        [-1.3,  1.0, -1.5]
    ]

    const lightPos = new vec3(0, 0, 0)

    // Compile shaders
    const lightVertSource = await readFile("lighting.vert")
    const lightFragSource = await readFile("lighting.frag")
    const lightVertShader = createShader(gl, gl.VERTEX_SHADER, lightVertSource)
    const lightFragShader = createShader(gl, gl.FRAGMENT_SHADER, lightFragSource)

    const vertexShaderSource = await readFile("cube.vert")
    const fragmentShaderSource = await readFile("cube.frag")
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    // Create programs
    const program = createProgram(gl, vertexShader, fragmentShader)
    const lightProgram = createProgram(gl, lightVertShader, lightFragShader)
    
    // Projections
    let projection = mat4.create()
    let view = new mat4(1,0,0,0,  0,1,0,0,  0,0,1,cameraPos[2],  0,0,0,1)
    let model = mat4.identity(mat4.create())
    
    // Cube VAO
    const cubeVAO = gl.createVertexArray()
    const VBO = gl.createBuffer()
    
    gl.bindVertexArray(cubeVAO)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0)
    gl.enableVertexAttribArray(0)
    
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4)
    gl.enableVertexAttribArray(1)
    
    // Lighting VAO
    const lightVAO = gl.createVertexArray()
    gl.bindVertexArray(lightVAO)
    // gl.bindBuffer(gl.ARRAY_BUFFER, VBO) // This is already bound
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 6 * 4, 0)
    gl.enableVertexAttribArray(3)


    // Get uniform locations
    const projectionLoc = gl.getUniformLocation(program, "projection")
    const viewLoc = gl.getUniformLocation(program, "view")
    const modelLoc = gl.getUniformLocation(program, "model")
    const objColorLoc = gl.getUniformLocation(program, "objectColor")
    const cubelightColorLoc = gl.getUniformLocation(program, "lightColor")
    const lightPosLoc = gl.getUniformLocation(program, "lightPos")
    const cameraPosLoc = gl.getUniformLocation(program, "cameraPos")

    const lightProjectionLoc = gl.getUniformLocation(lightProgram, "projection")
    const lightViewLoc = gl.getUniformLocation(lightProgram, "view")
    const lightModelLoc = gl.getUniformLocation(lightProgram, "model")
    const lightColorLoc = gl.getUniformLocation(lightProgram, "lightColor")


    // Set uniforms that don't need to change every frame
    gl.useProgram(lightProgram)
    gl.uniformMatrix4fv(lightModelLoc, false, mat4.create(model).scale(new vec3(.25,.25,.25)))
    // gl.uniform3f(lightColorLoc, 1, 1, 1)

    gl.useProgram(program)
    gl.uniform3f(objColorLoc, 1, .5, .31)
    // gl.uniform3f(cubelightColorLoc, 1, 1, 1)

    
    // WebGL Settings
    resizeCanvasToDisplaySize(canvas)
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(...clearColor)

    
    function loop(time) {
        deltaTime = (time - lastTime) / 1000.
        lastTime = time
        calculateFPS()
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
        // Handle movement and looking
        handleMovement()
        mat4.lookAt(view, cameraPos, vec3.add(vec3.create(), cameraPos, cameraForward), up)
        lightPos.z = (Math.sin(time * .001) + .5) * -2.5
        
        gl.useProgram(program)
        gl.bindVertexArray(cubeVAO)

        const rainbow = getRainbowColor(time * .001).normalize()
        gl.uniform3f(cubelightColorLoc, ...rainbow)
        gl.uniform3f(lightPosLoc, ...lightPos)
        gl.uniform3f(cameraPosLoc, ...cameraPos)

        gl.uniformMatrix4fv(viewLoc, false, view)
        gl.uniformMatrix4fv(projectionLoc, false, projection)
        gl.uniformMatrix4fv(modelLoc, false, model)
        
        for (let i = 0; i < cubePositions.length; i++) {
            let model = mat4.identity(mat4.create())
            mat4.translate(model, model, new vec3(...cubePositions[i]))

            let angle = 20 * i
            angle += time * .05 * Math.sin(i + 1)
            model.rotate(radians(angle), new vec3(1, .3, .5))
            // model.scale(new vec3(1, .2, 4))
            
            gl.uniformMatrix4fv(modelLoc, false, model)
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
    
        gl.useProgram(lightProgram)
        gl.bindVertexArray(lightVAO)

        gl.uniform3f(lightColorLoc, ...rainbow)

        gl.uniformMatrix4fv(lightModelLoc, false, mat4.create(model).translate(lightPos).scale(new vec3(.25,.25,.25)))
        gl.uniformMatrix4fv(lightProjectionLoc, false, projection)
        gl.uniformMatrix4fv(lightViewLoc, false, view)


        gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(loop)
    }
    
    loop(0)

    // ********************* LISTENERS *********************
    canvas.addEventListener("click", async () => {
        await canvas.requestPointerLock({
            unadjustedMovement: true // disable OS-level mouse accel
        })
    })

    canvas.addEventListener("mousemove", e => {
        if (document.pointerLockElement == null) return

        yaw += e.movementX * mouseSensitivity
        pitch -= e.movementY * mouseSensitivity
        
        yaw %= 360.
        pitch = pitch > 89.9 ? 89.9 : pitch < -89.9 ? -89.9 : pitch

        let desiredLookDir = new vec3(
            Math.cos(radians(yaw)) * Math.cos(radians(pitch)),
            Math.sin(radians(pitch)),
            Math.sin(radians(yaw)) * Math.cos(radians(pitch))
        )

        // cameraForward = vec3.lerp(vec3.create(), cameraForward, desiredLookDir, cameraLerp)
        cameraForward = desiredLookDir
        cameraRight = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), cameraForward, up))
        cameraUp = vec3.cross(vec3.create(), cameraRight, cameraForward)
    })

    window.addEventListener("resize", (e) => {
        resizeCanvasToDisplaySize(canvas)
    })

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true
    })
    
    document.addEventListener('keyup', (event) => {
        delete keysPressed[event.key]
    })

    document.addEventListener('wheel', e => {
        if (document.pointerLockElement == null) return

        fov += deltaTime * e.deltaY
        projection = mat4.perspectiveNO(mat4.create(), radians(fov), canvas.width/canvas.height, zNear, zFar)
    })

    // ********************* HELPER METHODS *********************
    function handleMovement() {
        let input = vec3.create()
        if (keysPressed["w"]) input[2] += 1
        if (keysPressed["s"]) input[2] -= 1
        if (keysPressed["a"]) input[0] -= 1
        if (keysPressed["d"]) input[0] += 1
        if (keysPressed["q"]) input[1] -= 1
        if (keysPressed["e"]) input[1] += 1

        vec3.normalize(input, input)

        let move = vec3.create()
        vec3.add(move, move, vec3.scale(vec3.create(), cameraRight, input[0]))
        vec3.add(move, move, vec3.scale(vec3.create(), up, input[1]))
        vec3.add(move, move, vec3.scale(vec3.create(), cameraForward, input[2]))
        vec3.scale(move, move, deltaTime * moveSpeed)

        vec3.add(cameraPos, cameraPos, move)
    }

    function resizeCanvasToDisplaySize(canvas) {
        fullScreenCanvas(canvas, aspectRatio)

        gl.viewport(0, 0, canvas.width, canvas.height)
        projection = mat4.perspectiveNO(mat4.create(), radians(fov), canvas.width/canvas.height, zNear, zFar)
    }

    function loadImage(img, src) {
        return new Promise((res, rej) => {
            img.onload = () => res()
            img.onerror = () => {
                console.error(`Failed to load image from "${src}"`)
                rej()
            }
            img.src = src
        })
    }

    function calculateFPS() {
        frameCount++
        accumulatedTime += deltaTime * 1000
    
        if (accumulatedTime > fpsInterval) {
            fps = frameCount / accumulatedTime * 1000
            
            fpsArray.push(fps)
            if (fpsArray.length > maxFpsSamples)
                fpsArray.shift()
    
            const averageFps = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length
            fpsDisplay.textContent = `FPS: ${averageFps.toFixed(2)}`

            // Reset for the next interval
            frameCount = 0
            accumulatedTime = 0
        }
    }
}

main()

export function setMouseSensitivity(sensitivity) {
    sensitivity = parseFloat(sensitivity)
    mouseSensitivity = !isNaN(sensitivity) ? sensitivity : 0
    console.log(mouseSensitivity)
    return mouseSensitivity
}

export function setMoveSpeed(speed) {
    speed = parseFloat(speed)
    moveSpeed = !isNaN(speed) ? speed : 0
    return moveSpeed
}