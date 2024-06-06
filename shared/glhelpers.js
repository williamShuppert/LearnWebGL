function readFile(path) {
    return fetch(path).then(r => r.text())
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) return shader

    console.log(source)
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    var success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) console.error(gl.getProgramInfoLog(program))

    return program
}