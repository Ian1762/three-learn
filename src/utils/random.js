const random = `
    // 3D Randomness
    float random(vec3 pos){
      return fract(sin(dot(pos, vec3(64.25375463, 23.27536534, 86.29678483))) * 59482.7542);
    }
`

export default random