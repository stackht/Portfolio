// WGSL for the contact section: cobalt caustics, the light pattern a glass or water
// surface throws on the floor. Fades toward the top so the copy above stays calm.
export const CAUSTICS_WGSL = /* wgsl */ `
struct Params {
  size: vec2f,
  time: f32,
  dpr: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

fn caustic(q: vec2f, t: f32) -> f32 {
  let p = q - vec2f(250.0, 250.0);
  var i = p;
  var c = 1.0;
  let inten = 0.005;
  for (var n = 0; n < 5; n++) {
    let tt = t * (1.0 - 3.5 / f32(n + 1));
    i = p + vec2f(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2f(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c = c / 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = params.size / params.dpr;
  let p = uv * res / 260.0;
  let bg = vec3f(0.953, 0.957, 0.965);
  let cobalt = vec3f(0.169, 0.314, 1.0);
  let light = clamp(caustic(p, params.time * 0.35 + 23.0), 0.0, 1.0);
  // Light across the whole section, stronger toward the floor; a soft wash keeps the
  // upper area tinted rather than blank.
  let mask = 0.35 + 0.65 * smoothstep(0.0, 1.0, uv.y);
  let wash = mix(bg, vec3f(0.89, 0.91, 0.99), smoothstep(0.0, 1.0, uv.y));
  var col = mix(wash, cobalt, light * 0.4 * mask);
  return vec4f(col, 1.0);
}
`
