export class Attenuation {
    constructor(constant, linear, quadratic) {
        this.constant = constant
        this.linear = linear
        this.quadratic = quadratic
    }
}

export class PointLight {
    constructor(position, ambient, diffuse, specular, attenuation) {
        this.position = position
        this.ambient = ambient
        this.diffuse = diffuse
        this.specular = specular
        this.attenuation = attenuation
    }
}