function getBaseColorTexture(material) {
    if (material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture) {
        return material.pbrMetallicRoughness.baseColorTexture;
    }

    const extensions = material.extensions;
    if (extensions && extensions.KHR_materials_pbrSpecularGlossiness && extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture) {
        return extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture;
    }

    return null;
}

function extractVertices(gltf, arrayBuffer, accessor, indexAccessor, componentCount = 3) {
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const indexBufferView = gltf.bufferViews[indexAccessor.bufferView];

    const offset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const indexOffset = (indexBufferView.byteOffset || 0) + (indexAccessor.byteOffset || 0);

    const dataArray = new Float32Array(arrayBuffer, offset, accessor.count * componentCount);
    
    let indexArray = null;
    if(indexAccessor.componentType == 5125){
        indexArray = new Uint32Array(arrayBuffer, indexOffset, indexAccessor.count);
    }else if(indexAccessor.componentType == 5123){
        indexArray = new Uint16Array(arrayBuffer, indexOffset, indexAccessor.count);
    }
    const vertices = [];
    for (let i = 0; i < indexArray.length; i += 3) {
        for (let j = 0; j < 3; j++) {
            const vertexIndex = indexArray[i + j];
            const vertex = [];
            for (let k = 0; k < componentCount; k++) {
                vertex.push(dataArray[vertexIndex * componentCount + k]);
            }
            vertices.push(vertex);
        }
    }
    return vertices;
}

async function loadGLTF(prefix, url) {
    // Load the .gltf JSON file
    const response = await fetch(prefix + url);
    const gltf = await response.json();

    // Load the binary buffer (.bin) if it's external
    const bufferUri = prefix + gltf.buffers[0].uri;
    const arrayBuffer = await fetch(bufferUri).then(res => res.arrayBuffer());

    const meshes = [];

    // Process each mesh in the glTF
    for (const mesh of gltf.meshes) {
        for (const primitive of mesh.primitives) {
            const positionAccessor = gltf.accessors[primitive.attributes.POSITION];
            const normalAccessor = gltf.accessors[primitive.attributes.NORMAL];
            const texCoordAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
            const indexAccessor = gltf.accessors[primitive.indices];

            const positions = extractVertices(gltf, arrayBuffer, positionAccessor, indexAccessor);
            const normals = extractVertices(gltf, arrayBuffer, normalAccessor, indexAccessor);
            const texCoords = extractVertices(gltf, arrayBuffer, texCoordAccessor, indexAccessor, 2); 

            let mat_id = primitive.material
            const material = gltf.materials[mat_id];
            const textureIndex = getBaseColorTexture(material)
            const texture = gltf.textures[textureIndex.index];
            const imageIndex = texture.source;
            const image = gltf.images[imageIndex];

            meshes.push({
                texture: image.uri,
                positions: new Float32Array(positions.flat(Infinity)), 
                normals: new Float32Array(normals.flat(Infinity)), 
                texcoords: new Float32Array(texCoords.flat(Infinity))
            });
        }
    }

    return meshes;
}

async function loadImage(prefix, urls) {
    return Promise.all(
        urls.map(url => 
            new Promise((resolve, reject) => {
                const image = new Image();
                image.src = prefix + url;
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error(`Failed to load image at ${url}`));
            })
        )
    );
}