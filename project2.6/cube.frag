#version 300 es
precision highp float;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D emission;
    float shininess;
};

struct DirectionalLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

struct SpotLight {
    vec3 position;
    vec3 direction;

    float cutOff;
    float outerCutOff; 

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoords;

out vec4 FragColor;

uniform vec3 cameraPos;
uniform Material material;
uniform DirectionalLight dirLight;
#define NR_POINT_LIGHTS 4  
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;

vec3 CalcDirectional(DirectionalLight light, vec3 normal, vec3 viewDir);
vec3 CalcPoint(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpot(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
    // properties
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(cameraPos - FragPos);

    // phase 1: Directional lighting
    vec3 res = CalcDirectional(dirLight, norm, viewDir);
    // phase 2: Point lights
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        res += CalcPoint(pointLights[i], norm, FragPos, viewDir);    
    // phase 3: Spot light
    res += CalcSpot(spotLight, norm, FragPos, viewDir);
    
    FragColor = vec4(res, 1.0);
}

vec3 CalcDirectional(DirectionalLight light, vec3 normal, vec3 viewDir) {
    vec3 diffuseSample = vec3(texture(material.diffuse, TexCoords));
    vec3 specularSample = vec3(texture(material.specular, TexCoords));

    // ambient
    vec3 ambient = light.ambient * diffuseSample;

    // diffuse
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * diffuseSample;

    // specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * (spec * specularSample);

    return ambient + diffuse + specular;
}

vec3 CalcPoint(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 diffuseSample = vec3(texture(material.diffuse, TexCoords));
    vec3 specularSample = vec3(texture(material.specular, TexCoords));

    // ambient
    vec3 ambient  = light.ambient  * diffuseSample;
    
    // diffuse
    vec3 lightDir = normalize(light.position - fragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse  = light.diffuse  * diff * diffuseSample;

    // specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * specularSample;

    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    return ambient + diffuse + specular;
}

vec3 CalcSpot(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 diffuseSample = vec3(texture(material.diffuse, TexCoords));
    vec3 specularSample = vec3(texture(material.specular, TexCoords));

    // ambient
    vec3 ambient = light.ambient * diffuseSample;

    // diffuse
    vec3 lightDir = normalize(light.position - fragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * diffuseSample;

    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * specularSample;

    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    // spotlight intensity
    float theta = dot(lightDir, normalize(-light.direction)); 
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    // combine attenuation and spotlight intensity
    ambient *= attenuation * intensity;
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;

    // combine results
    return (ambient + diffuse + specular);
}