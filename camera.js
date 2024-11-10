function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function quaternionFromAxisAngle(axis, angle) {
  const halfAngle = degreesToRadians(angle) / 2;
  const s = Math.sin(halfAngle);

  return [
      Math.cos(halfAngle),          // w
      axis[0] * s,                  // x
      axis[1] * s,                  // y
      axis[2] * s                   // z
  ];
}

function combinedQuaternion(yaw, pitch, roll) {
  const qYaw = quaternionFromAxisAngle([0, 1, 0], yaw);  
  const qPitch = quaternionFromAxisAngle([1, 0, 0], pitch);
  const qRoll = quaternionFromAxisAngle([0, 0, 1], roll);   
  // yaw, pitch, then roll
  return quaternionMultiply(quaternionMultiply(qYaw, qPitch), qRoll);
}

function rotateVectorByQuaternion(v, q) {
  const [qw, qx, qy, qz] = q;
  const qConjugate = [qw, -qx, -qy, -qz];
  const vQuat = [0, ...v];
  const qv = quaternionMultiply(q, vQuat);
  const rotatedQuat = quaternionMultiply(qv, qConjugate);
  return [rotatedQuat[1], rotatedQuat[2], rotatedQuat[3]];
}

function quaternionMultiply(a, b) {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;

  return [
      aw * bw - ax * bx - ay * by - az * bz,  // w
      aw * bx + ax * bw + ay * bz - az * by,  // x
      aw * by - ax * bz + ay * bw + az * bx,  // y
      aw * bz + ax * by - ay * bx + az * bw   // z
  ];
}

class Camera {
    constructor(position, frontVector, upVector, fov, aspectRatio, near, far) {
      this.position = position; 
      this.frontVector = frontVector;
      this.upVector = upVector;  
      
      this.fov = degreesToRadians(fov);          
      this.aspectRatio = aspectRatio;  
      this.near = near;         
      this.far = far;

      this.yaw = 43;
      this.pitch = -24;
      this.roll = 0;
      
      this.viewMatrix = this.computeViewMatrix();
      this.projectionMatrix = this.computeProjectionMatrix();
    }
  
    computeProjectionMatrix() {
      const f = 1.0 / Math.tan(this.fov / 2);
      const rangeInv = 1.0 / (this.near - this.far);
  
      return [
        f / this.aspectRatio, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (this.near + this.far) * rangeInv, this.near * this.far * rangeInv * 2,
        0, 0, -1, 0
      ];
    }
  
    computeViewMatrix() {
      let zAxis = this.normalize(this.frontVector); 
      let xAxis = this.normalize(this.cross(this.upVector, zAxis)); 
      let yAxis = this.cross(zAxis, xAxis); 
      const cameraQuaternion = combinedQuaternion(this.yaw, this.pitch, this.roll);

      xAxis = rotateVectorByQuaternion(xAxis, cameraQuaternion);
      yAxis = rotateVectorByQuaternion(yAxis, cameraQuaternion);
      zAxis = rotateVectorByQuaternion(zAxis, cameraQuaternion);

      return [
            xAxis[0], xAxis[1], xAxis[2], -this.dot(xAxis, this.position),
            yAxis[0], yAxis[1], yAxis[2], -this.dot(yAxis, this.position),
            zAxis[0], zAxis[1], zAxis[2], -this.dot(zAxis, this.position),
            0, 0, 0, 1
        ]
    }
  
    normalize(vec) {
      const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
      return [vec[0] / length, vec[1] / length, vec[2] / length];
    }
  
    dot(v1, v2) {
      return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
  
    cross(v1, v2) {
      return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
      ];
    }
  
    updateProjection(fov, aspectRatio, near, far) {
      this.fov = fov;
      this.aspectRatio = aspectRatio;
      this.near = near;
      this.far = far;
    }

    get_cam_axis(){
      let zAxis = this.normalize(this.frontVector);
      let xAxis = this.normalize(this.cross(this.upVector, zAxis)); 
      let yAxis = this.cross(zAxis, xAxis);
      const cameraQuaternion = combinedQuaternion(this.yaw, this.pitch, this.roll);
      xAxis = rotateVectorByQuaternion(xAxis, cameraQuaternion);
      yAxis = rotateVectorByQuaternion(yAxis, cameraQuaternion);
      zAxis = rotateVectorByQuaternion(zAxis, cameraQuaternion);
      return [xAxis, yAxis, zAxis];
    }
}
  
