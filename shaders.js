function create_shader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        shader_name = "vertex"
        if(type == gl.FRAGMENT_SHADER)
            shader_name = "fragment"
        console.log(shader_name + " shader create success!")
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function create_program(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        console.log("create program success!")
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function create_texture(image){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image,
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

vertex_shader_code = `
    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform vec3 color;
    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;

    void main() {
        gl_Position = proj_view * model * vec4(a_position, 1.0);
        normal = normalize((model * vec4(a_normal, 0.0)).xyz); // world normal
        frag_color = color;
        world_pos = model * vec4(a_position, 1.0);
    }`

fragment_shader_code = `
    precision mediump float;
    varying vec3 frag_color;
    varying vec3 normal;
    varying vec4 world_pos;
    uniform vec3 camera_pos;

    // use a simple hard-coded directional light
    // const vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0)); 
    // const vec3 lightColor = vec3(1.0, 1.0, 1.0); 
    const vec3 ambientLight = vec3(.5, 0.5, 0.5); 

    uniform vec3 light_pos;
    uniform vec3 light_color;
    uniform float intensity;

    void main() {
        vec3 lightDirection = normalize(world_pos.xyz - light_pos);
        float diff = max(dot(normal, -lightDirection), 0.0);
        vec3 diffuse = diff * light_color * frag_color * intensity;
        vec3 ambient = ambientLight * frag_color;

        vec3 viewDirection = normalize(camera_pos - world_pos.xyz);
        vec3 reflectDirection = reflect(lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 100.0);
        vec3 specular = spec * light_color * intensity;

        vec3 finalColor = ambient + diffuse + specular;

        gl_FragColor = vec4(finalColor, 1.0);
    }`



vertex_shader_code_wire = `
    attribute vec3 a_position;

    uniform vec3 color;
    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 frag_color;

    void main() {
        gl_Position = proj_view * model * vec4(a_position, 1.0);
        frag_color = color;
    }`

fragment_shader_code_wire = `
    precision mediump float;
    varying vec3 frag_color;

    void main() {
        gl_FragColor = vec4(frag_color, 1.0);
    }`

vertex_shader_code_models = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;

    uniform mat4 model;
    uniform mat4 proj_view;
    varying vec3 normal;
    varying vec4 world_pos;
    varying vec2 texc;

    void main() {
        gl_Position = proj_view * model * vec4(a_position, 1.0);
        normal = normalize((model * vec4(a_normal, 0.0)).xyz); // world normal
        world_pos = model * vec4(a_position, 1.0);
        texc = a_texcoord;
    }`

fragment_shader_code_models = `
    precision mediump float;
    varying vec3 normal;
    varying vec4 world_pos;
    uniform vec3 camera_pos;
    varying vec2 texc;

    uniform sampler2D tex1;

    uniform vec3 kakdks;

    // use a simple hard-coded directional light
    // const vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0)); 
   
    const vec3 ambientLight = vec3(.5, 0.5, 0.5);

    uniform vec3 light_pos;
    uniform vec3 light_color;
    uniform float intensity;

    void main() {
        vec3 lightDirection = normalize(world_pos.xyz - light_pos);
        vec4 base_color = texture2D(tex1, texc); 
        float alpha = base_color.w;
        if (alpha == 0.0) {
            discard; 
        }
        // base_color = vec4(1, 1, 1, 1);
        float diff = max(dot(normal, -lightDirection), 0.0);
        vec3 diffuse = diff * light_color * base_color.xyz * intensity;
        vec3 ambient = ambientLight * base_color.xyz;

        vec3 viewDirection = normalize(camera_pos - world_pos.xyz);
        vec3 reflectDirection = reflect(lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 100.0);
        vec3 specular = spec * light_color * intensity;

        vec3 finalColor = kakdks.x * ambient + kakdks.y * diffuse + kakdks.z * specular;

        gl_FragColor = vec4(finalColor, 1.0);
    }`
