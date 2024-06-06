// Referencing information from https://learnopengl.com/Introduction, adapted to WebGL

const glm = glMatrix
const radians = glm.glMatrix.toRadian

async function main() {
    const canvas = document.getElementById('gl')
    const gl = canvas.getContext('webgl2')
    
    if (!gl) {
        prompt("WebGL2 is not supported by your browser.")
        return
    }

    // Settings
    let fov = 75
    const mouseSensitivity = .1
    const aspectRatio = 16/9.
    const moveSpeed = 5
    const clearColor = [.2, .3, .3, 1]
    const fpsInterval = 500 // How often to calculate FPS, in milliseconds
    const maxFpsSamples = 5 // Number of FPS samples
    const zNear = .05
    const zFar = 100
    
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
    let up = glm.vec3.fromValues(0, 1, 0)
    
    // Camera transform data
    let cameraPos = glm.vec3.fromValues(0, 0, 3)
    let cameraForward = glm.vec3.fromValues(0, 0, -1)
    let cameraRight = glm.vec3.normalize(glm.vec3.create(), glm.vec3.cross(glm.vec3.create(), cameraForward, up))
    let cameraUp = glm.vec3.cross(glm.vec3.create(), cameraRight, cameraForward)
    let yaw = -90, pitch = 0
    
    let img = new Image()
    await loadImage(img, "../shared/container.jpg")

    let vertices = [
        -0.5, -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 0.0,
    
        -0.5, -0.5,  0.5,  0.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
    
        -0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5,  1.0, 0.0,
    
         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
    
        -0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
    
        -0.5,  0.5, -0.5,  0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0
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

    const vertexShaderSource = `#version 300 es
    
    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;
    
    layout(location=0) in vec3 aPos;
    layout(location=1) in vec2 aTexCoord;
    
    out vec2 TexCoord;
    
    void main() {
        gl_Position = projection * view * model * vec4(aPos, 1.0);
    
        TexCoord = aTexCoord;
    }
    `
     
    const fragmentShaderSource = `#version 300 es
    precision highp float;
     
    uniform sampler2D ourTexture;
    
    in vec2 TexCoord;
    
    out vec4 FragColor;
    
    void main() {
        FragColor = texture(ourTexture, TexCoord);
    }
    `
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vertexShader, fragmentShader)
    
    const projectionLoc = gl.getUniformLocation(program, "projection")
    const viewLoc = gl.getUniformLocation(program, "view")
    const modelLoc = gl.getUniformLocation(program, "model")
    
    let projection = glm.mat4.create()
    let view = glm.mat4.fromValues(1,0,0,0,  0,1,0,0,  0,0,1,cameraPos[2],  0,0,0,1)
    let model = glm.mat4.identity(glm.mat4.create())
    
    const VAO = gl.createVertexArray()
    const VBO = gl.createBuffer()
    
    gl.bindVertexArray(VAO)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0)
    gl.enableVertexAttribArray(0)
    
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4)
    gl.enableVertexAttribArray(1)
    
    let textureLoc = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureLoc)
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, img.width, img.height, 0, gl.RGB, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)
    
    gl.useProgram(program)
    gl.bindVertexArray(VAO)
    
    gl.uniformMatrix4fv(projectionLoc, false, projection)
    gl.uniformMatrix4fv(viewLoc, false, view)
    gl.uniformMatrix4fv(modelLoc, false, model)
    
    // WebGL Settings
    resizeCanvasToDisplaySize(canvas)
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(...clearColor) 
    
    function loop(time) {
        deltaTime = (time - lastTime) / 1000.
        lastTime = time
        calculateFPS()
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
        handleMovement()
        view = glm.mat4.lookAt(view, cameraPos, glm.vec3.add(glm.vec3.create(), cameraPos, cameraForward), up)
        gl.uniformMatrix4fv(viewLoc, false, view)
        

        for (let i = 0; i < cubePositions.length; i++) {
            let model = glm.mat4.identity(glm.mat4.create())
            glm.mat4.translate(model, model, glm.vec3.fromValues(...cubePositions[i]))

            let angle = 20 * i
            angle += time * .05 * Math.sin(i + 1)
            glm.mat4.rotate(model, model, radians(angle), glm.vec3.fromValues(1, .3, .5))
            
            gl.uniformMatrix4fv(modelLoc, false, model)
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
    
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

        let desiredLookDir = glm.vec3.fromValues(
            Math.cos(radians(yaw)) * Math.cos(radians(pitch)),
            Math.sin(radians(pitch)),
            Math.sin(radians(yaw)) * Math.cos(radians(pitch))
        )

        // cameraForward = glm.vec3.lerp(glm.vec3.create(), cameraForward, desiredLookDir, cameraLerp)
        cameraForward = desiredLookDir
        cameraRight = glm.vec3.normalize(glm.vec3.create(), glm.vec3.cross(glm.vec3.create(), cameraForward, up))
        cameraUp = glm.vec3.cross(glm.vec3.create(), cameraRight, cameraForward)
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
        projection = glm.mat4.perspective(glm.mat4.create(), radians(fov), canvas.width/canvas.height, zNear, zFar)
        gl.uniformMatrix4fv(projectionLoc, false, projection)
    })

    // ********************* HELPER METHODS *********************
    function handleMovement() {
        let input = glm.vec3.create()
        if (keysPressed["w"]) input[2] += 1
        if (keysPressed["s"]) input[2] -= 1
        if (keysPressed["a"]) input[0] -= 1
        if (keysPressed["d"]) input[0] += 1
        if (keysPressed["q"]) input[1] -= 1
        if (keysPressed["e"]) input[1] += 1

        glm.vec3.normalize(input, input)

        let move = glm.vec3.create()
        glm.vec3.add(move, move, glm.vec3.scale(glm.vec3.create(), cameraRight, input[0]))
        glm.vec3.add(move, move, glm.vec3.scale(glm.vec3.create(), cameraUp, input[1]))
        glm.vec3.add(move, move, glm.vec3.scale(glm.vec3.create(), cameraForward, input[2]))
        glm.vec3.scale(move, move, deltaTime * moveSpeed)

        glm.vec3.add(cameraPos, cameraPos, move)
    }

    function resizeCanvasToDisplaySize(canvas) {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
    
        if (windowWidth / windowHeight > aspectRatio) {
            // Window is wider than the aspect ratio
            canvas.height = windowHeight
            canvas.width = windowHeight * aspectRatio
        } else {
            // Window is taller than the aspect ratio
            canvas.width = windowWidth
            canvas.height = windowWidth / aspectRatio
        }

        gl.viewport(0, 0, canvas.width, canvas.height)
        projection = glm.mat4.perspective(glm.mat4.create(), radians(fov), canvas.width/canvas.height, zNear, zFar)
        gl.uniformMatrix4fv(projectionLoc, false, projection)
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