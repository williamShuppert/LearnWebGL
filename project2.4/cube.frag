#version 300 es
precision highp float;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D emission;
    float shininess;
};
struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};


in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoords;

out vec4 FragColor;

uniform vec3 cameraPos;
uniform Material material;
uniform Light light; 

void main()
{
    vec3 diffuseSample = vec3(texture(material.diffuse, TexCoords));
    vec3 specularSample = vec3(texture(material.specular, TexCoords));

    // ambient
    vec3 ambient = light.ambient * diffuseSample;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * (diff * diffuseSample);
    
    // specular
    vec3 viewDir = normalize(cameraPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * (spec * specularSample);

    // emission
    vec3 emission = vec3(texture(material.emission, TexCoords));
        
    vec3 result = ambient + diffuse + specular + emission;
    FragColor = vec4(result, 1.0);
}