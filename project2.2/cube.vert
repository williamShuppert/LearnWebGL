#version 300 es

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;

out vec3 Normal;
out vec3 FragPos;

void main() {
    gl_Position = projection * view * model * vec4(aPos, 1.0);

    // These two are the same because they both remove the transform part of the vector.
    // We do this because normals are only direction vectors and do not represent a specific position in space.
    // Normal = mat3(model) * aNormal; or Normal = vec3(model * vec4(aNormal, 0));
    // However, this isn't enough because a non-uniform scale can also distort normals.
    // We need the normal matrix, which is the transpose of the inverse of the upper-left 3x3 part of the model matrix
    Normal = transpose(inverse(mat3(model))) * aNormal; // This is what I got from the above desc, it might not be right
    // Normal = mat3(transpose(inverse(model))) * aNormal; // This is what was in the book, I think they are the same, even testing with non-uniform scales mine still works
    // Inversing matrices is a costly, calculate the normal matrix on the CPU and send it to the shaders via a uniform

    FragPos = vec3(model * vec4(aPos, 1.0));
}