canvas = document.querySelector("#c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL is not supported.")
}
vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code);
fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code);

vertex_shader_wire = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_wire);
fragment_shader_wire = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_wire);

vertex_shader_models = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code_models);
fragment_shader_models = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code_models);

program = create_program(gl, vertex_shader, fragment_shader);
program_wire = create_program(gl, vertex_shader_wire, fragment_shader_wire);
program_models = create_program(gl, vertex_shader_models, fragment_shader_models)

position_loc = gl.getAttribLocation(program, "a_position")
normal_loc = gl.getAttribLocation(program, "a_normal")
color_loc = gl.getUniformLocation(program, 'color');
model_loc = gl.getUniformLocation(program, 'model');
proj_view_loc = gl.getUniformLocation(program, 'proj_view');
campos_loc = gl.getUniformLocation(program, 'camera_pos');
light_pos = gl.getUniformLocation(program, 'light_pos');
light_color = gl.getUniformLocation(program, 'light_color');
light_intensity = gl.getUniformLocation(program, 'intensity');

position_loc_wire = gl.getAttribLocation(program_wire, "a_position")
color_loc_wire = gl.getUniformLocation(program_wire, 'color');
model_loc_wire = gl.getUniformLocation(program_wire, 'model');
proj_view_loc_wire = gl.getUniformLocation(program_wire, 'proj_view');

position_loc_models = gl.getAttribLocation(program_models, "a_position")
normal_loc_models = gl.getAttribLocation(program_models, "a_normal")
texcoord_loc_models = gl.getAttribLocation(program_models, "a_texcoord")
model_loc_models = gl.getUniformLocation(program_models, 'model');
proj_view_loc_models = gl.getUniformLocation(program_models, 'proj_view');
sampler_loc = gl.getUniformLocation(program_models, 'tex1');
campos_loc_models = gl.getUniformLocation(program_models, 'camera_pos');
light_pos_models = gl.getUniformLocation(program_models, 'light_pos');
light_color_models = gl.getUniformLocation(program_models, 'light_color');
light_intensity_models = gl.getUniformLocation(program_models, 'intensity');
kakdks_loc = gl.getUniformLocation(program_models, 'kakdks');


(async () => {
    let light = {
        position: [0, 3, 5],
        color: [1, 1, 1],
        intensity: 1
    }
    let light_object = new Shape(generateSphere(1, 100, 100), color=[10, 10, 10]);
    const model_data = await loadGLTF("third-party-mesh/", 'test.gltf');
    image_dict = {}
    let object = []
    model_data.forEach(mesh => {
        let position_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

        let normal_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, normal_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);

        let tex_vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, tex_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.texcoords, gl.STATIC_DRAW);

        object.push([mesh.texture, position_vbo, normal_vbo, tex_vbo, mesh.positions.length / 3])
        image_dict[mesh.texture] = 1
    });

    let keys = Object.keys(image_dict)
    const images = await loadImage("third-party-mesh/", keys)

    for(let i = 0; i < keys.length; i ++){
        image_dict[keys[i]] = create_texture(images[i])
    }


    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    render_hierarchy = false;
    hierarchy_colors = [
        [1, 0, 0],    
        [0, 1, 0],   
        [0, 0, 1],    
        [1, 1, 0],    
        [0, 1, 1],    
        [1, 0, 1],    
        [1, 0.65, 0], 
        [0.5, 0, 0.5], 
        [0, 0, 0],   
        [1, 1, 1]
    ];

    function create_vbos(scene){
        scene.create_vbos(gl);
        for (let i = 0; i < scene.get_children_count(); i++) {
            create_vbos(scene.get_child(i));
        }
    }

    function draw_mesh(object, model, proj_view, ka = 1.0, kd = 1.0, ks=1.0){
        object.forEach(mesh => {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[1])
            gl.vertexAttribPointer(
                position_loc_models,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[2])
            gl.vertexAttribPointer(
                normal_loc_models,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh[3])
            gl.vertexAttribPointer(
                texcoord_loc_models,
                2,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.enableVertexAttribArray(position_loc_models);
            gl.enableVertexAttribArray(normal_loc_models);
            gl.enableVertexAttribArray(texcoord_loc_models);

            gl.useProgram(program_models); 
            gl.uniformMatrix4fv(model_loc_models, false, new Float32Array(transpose4x4(model)));
            gl.uniformMatrix4fv(proj_view_loc_models, false, new Float32Array(proj_view));
            gl.uniform3fv(campos_loc_models, cam.position)
            gl.uniform3fv(light_color_models, new Float32Array(light.color));
            gl.uniform3fv(light_pos_models, new Float32Array(light.position));
            gl.uniform1f(light_intensity_models, light.intensity);
            gl.uniform3fv(kakdks_loc, new Float32Array([ka, kd, ks]))
            gl.uniform1i(sampler_loc, 0); 
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, image_dict[mesh[0]]);            
            gl.drawArrays(gl.TRIANGLES, 0, mesh[4]);
        });

    }

    function draw_scene(scene, model, proj_view, depth){
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_v)
        gl.vertexAttribPointer(
            position_loc,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_n)
        gl.vertexAttribPointer(
            normal_loc,
            3,                // Number of components per vertex (3 for vec3)
            gl.FLOAT,         // Data type
            false,            // Normalize
            0,                // Stride
            0                 // Offset
        );
        
        gl.useProgram(program); 
        gl.enableVertexAttribArray(position_loc);
        gl.enableVertexAttribArray(normal_loc);
        gl.uniform3fv(color_loc, new Float32Array(scene.color));
        gl.uniformMatrix4fv(model_loc, false, new Float32Array(transpose4x4(multiply4x4Matrices(model, scene.model_matrix))));
        gl.uniformMatrix4fv(proj_view_loc, false, new Float32Array(proj_view));
        gl.uniform3fv(campos_loc, cam.position)
        gl.uniform3fv(light_color, new Float32Array(light.color));
        gl.uniform3fv(light_pos, new Float32Array(light.position));
        gl.uniform1f(light_intensity, light.intensity);
        gl.drawArrays(gl.TRIANGLES, 0, scene.get_vertex_count());

        if(render_hierarchy){
            gl.useProgram(program_wire)
            gl.enableVertexAttribArray(position_loc_wire);
            gl.bindBuffer(gl.ARRAY_BUFFER, scene.vbo_b)
            gl.vertexAttribPointer(
                position_loc_wire,
                3,                // Number of components per vertex (3 for vec3)
                gl.FLOAT,         // Data type
                false,            // Normalize
                0,                // Stride
                0                 // Offset
            );
            gl.uniform3fv(color_loc_wire, new Float32Array(hierarchy_colors[depth]));
            gl.uniformMatrix4fv(model_loc_wire, false, new Float32Array(transpose4x4(multiply4x4Matrices(model, scene.model_matrix))));
            gl.uniformMatrix4fv(proj_view_loc_wire, false, new Float32Array(proj_view));
            gl.drawArrays(gl.LINES, 0, 24);
        }
        for (let i = 0; i < scene.get_children_count(); i++) {
            draw_scene(scene.get_child(i), multiply4x4Matrices(model, scene.model_matrix), proj_view, depth + 1);
        }
    }

    scene = create_windmill();
    create_vbos(scene, gl);
    create_vbos(light_object, gl)

    // 6, 10, 10
    let cam = new Camera([6.8177022726109975, 5.743524083182375, 7.604509621239423], [0, 0, 1], [0, 1, 0], 45, canvas.width / canvas.height, 0.1, 1000)

    function render (time) { 
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        proj = cam.computeProjectionMatrix()
        view = cam.computeViewMatrix()
        proj_view = transpose4x4(multiply4x4Matrices(proj, view))
        scene.get_child(0).get_child(0).rotate(0, 0.5, 0)    
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(1.5, 0, -1.5), get_scale_matrix(0.15)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(-1.5, 0, -1.5), get_scale_matrix(0.16)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(-1.5, 0, 1.5), get_scale_matrix(0.1)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(1.5, 0, 1.5), get_scale_matrix(0.05)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(2.0, 0, 1.5), get_scale_matrix(0.08)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(1.0, 0, 1.8), get_scale_matrix(0.06)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(-1.5, 0, 1.9), get_scale_matrix(0.1)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(1.2, 0, 2.1), get_scale_matrix(0.03)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(-1.5, 0, 2.5), get_scale_matrix(0.03)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(2.5, 0, 2.6), get_scale_matrix(0.07)), proj_view)
        draw_mesh(object, multiply4x4Matrices(get_translation_matrix(2.5, 0, -1), get_scale_matrix(0.1)), proj_view)
        draw_scene(scene, get_identity_matrix(), proj_view, 0)
        draw_scene(light_object, get_translation_matrix(light.position[0], light.position[1], light.position[2]), proj_view, 0)
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    window.addEventListener("keydown", (event) => {
        if(["w", "a", "s", "d"].includes(event.key)){
            let [x, y, z] = cam.get_cam_axis()
            let speed = 0.5
            if(event.key == 'w') scene.translate(speed * -z[0], speed * -z[1], speed * -z[2]);
            if(event.key == 's') scene.translate(speed * z[0], speed * z[1], speed * z[2]);
            if(event.key == 'a') scene.translate(speed * -x[0], speed * -x[1], speed * -x[2]);
            if(event.key == 'd') scene.translate(speed * x[0], speed * x[1], speed * x[2]);
        }
    
        if(["R", "Y", "P"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'R') cam.roll += speed;
            if(event.key == 'Y') cam.yaw += speed;
            if(event.key == 'P') cam.pitch += speed;
        }
    
        if(["r", "y", "p"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'r') cam.roll -= speed;
            if(event.key == 'y') cam.yaw -= speed;
            if(event.key == 'p') cam.pitch -= speed;
        }
    
        if (event.key === "ArrowUp" || event.key === "ArrowDown"){
            let sign = -1;
            if(event.key === "ArrowDown") sign = 1
            let speed = 0.5;
            let [x, y, z] = cam.get_cam_axis()
            cam.position[0] += sign * speed * z[0];
            cam.position[1] += sign * speed * z[1];
            cam.position[2] += sign * speed * z[2];
        }
    
        if (event.key === "ArrowLeft" || event.key === "ArrowRight"){
            let sign = 1;
            if(event.key === "ArrowLeft") sign = -1
            let speed = 0.5;
            let [x, y, z] = cam.get_cam_axis()
            cam.position[0] += sign * speed * x[0];
            cam.position[1] += sign * speed * x[1];
            cam.position[2] += sign * speed * x[2];
        }
    
        if (event.key == "h"){
            render_hierarchy ^= 1
        }

        if(["C", "V", "B"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'C') light.position[0] += speed
            if(event.key == 'V') light.position[1] += speed;
            if(event.key == 'B') light.position[2] += speed;
        }
    
        if(["c", "v", "b"].includes(event.key)){
            let speed = 1.0
            if(event.key == 'c') light.position[0] -= speed;
            if(event.key == 'v') light.position[1] -= speed;
            if(event.key == 'b') light.position[2] -= speed;
        }
    });
    
    window.camera = cam;
})();