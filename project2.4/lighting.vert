#version 300 es

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

layout(location=3) in vec3 aPos;
layout(location=1) in vec3 aNormal;

out vec3 Normal;

void main() {
    gl_Position = projection * view * model * vec4(aPos, 1.0);

    Normal = aNormal;
}