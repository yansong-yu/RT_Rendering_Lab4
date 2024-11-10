function transpose4x4(matrix) {
    const transposed = new Array(16);

    transposed[0] = matrix[0];
    transposed[1] = matrix[4];
    transposed[2] = matrix[8];
    transposed[3] = matrix[12];

    transposed[4] = matrix[1];
    transposed[5] = matrix[5];
    transposed[6] = matrix[9];
    transposed[7] = matrix[13];

    transposed[8] = matrix[2];
    transposed[9] = matrix[6];
    transposed[10] = matrix[10];
    transposed[11] = matrix[14];

    transposed[12] = matrix[3];
    transposed[13] = matrix[7];
    transposed[14] = matrix[11];
    transposed[15] = matrix[15];

    return transposed;
}

function get_identity_matrix(){
    return [
        1, 0, 0, 0, 
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function get_scale_matrix(scale){
    return [
        scale, 0, 0, 0, 
        0, scale, 0, 0, 
        0, 0, scale, 0,
        0, 0, 0, 1
    ];
}

function get_rotate_matrix(tx, ty, tz){
    const cos = Math.cos;
    const sin = Math.sin;
  
    const Rx = [
      1, 0, 0, 0,
      0, cos(tx), -sin(tx), 0,
      0, sin(tx), cos(tx), 0,
      0, 0, 0, 1
    ];
  
    const Ry = [
      cos(ty), 0, sin(ty), 0,
      0, 1, 0, 0,
      -sin(ty), 0, cos(ty), 0,
      0, 0, 0, 1
    ];
  
    const Rz = [
      cos(tz), -sin(tz), 0, 0,
      sin(tz), cos(tz), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    const Rxy = multiply4x4Matrices(Rx, Ry);
    const R = multiply4x4Matrices(Rxy, Rz);
    return R;
}

function get_translation_matrix(tx, ty, tz){
    return [
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1
    ];
}

function multiply4x4Matrices(A, B) {
    const result = new Array(16).fill(0);
    // Perform matrix multiplication
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += A[i * 4 + k] * B[k * 4 + j];
        }
      }
    }
    return result;
  }


