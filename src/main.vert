attribute vec4 a_Pos;
attribute vec4 a_Col;

varying vec4 v_Col;

void main(){
    // TODO implement scaling
    gl_Position = a_Pos;
    v_Col = a_Col;
}