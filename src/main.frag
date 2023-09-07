precision mediump float;

varying vec4 v_Col;
uniform float u_Time;
uniform float u_Colors[3];


void main(){
    // 247, 135, 2
    // gl_FragColor = vec4(0.9686, 0.5294, 0.0078, 1);
    gl_FragColor = v_Col;
}