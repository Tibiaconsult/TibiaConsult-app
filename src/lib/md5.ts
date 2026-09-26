// MD5 compacto (domínio público), usado só para montar o endereço das imagens da TibiaWiki,
// que o MediaWiki guarda em /images/<md5[0]>/<md5[0..1]>/<arquivo>.

function add(x: number, y: number) {
  const l = (x & 0xffff) + (y & 0xffff);
  return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
}
const rol = (n: number, c: number) => (n << c) | (n >>> (32 - c));
const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => add(rol(add(add(a, q), add(x, t)), s), b);
const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t);
const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t);
const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t);
const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t);

function core(x: number[], len: number): number[] {
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    const X = (k: number) => x[i + k] | 0;
    a = ff(a, b, c, d, X(0), 7, -680876936); d = ff(d, a, b, c, X(1), 12, -389564586); c = ff(c, d, a, b, X(2), 17, 606105819); b = ff(b, c, d, a, X(3), 22, -1044525330);
    a = ff(a, b, c, d, X(4), 7, -176418897); d = ff(d, a, b, c, X(5), 12, 1200080426); c = ff(c, d, a, b, X(6), 17, -1473231341); b = ff(b, c, d, a, X(7), 22, -45705983);
    a = ff(a, b, c, d, X(8), 7, 1770035416); d = ff(d, a, b, c, X(9), 12, -1958414417); c = ff(c, d, a, b, X(10), 17, -42063); b = ff(b, c, d, a, X(11), 22, -1990404162);
    a = ff(a, b, c, d, X(12), 7, 1804603682); d = ff(d, a, b, c, X(13), 12, -40341101); c = ff(c, d, a, b, X(14), 17, -1502002290); b = ff(b, c, d, a, X(15), 22, 1236535329);
    a = gg(a, b, c, d, X(1), 5, -165796510); d = gg(d, a, b, c, X(6), 9, -1069501632); c = gg(c, d, a, b, X(11), 14, 643717713); b = gg(b, c, d, a, X(0), 20, -373897302);
    a = gg(a, b, c, d, X(5), 5, -701558691); d = gg(d, a, b, c, X(10), 9, 38016083); c = gg(c, d, a, b, X(15), 14, -660478335); b = gg(b, c, d, a, X(4), 20, -405537848);
    a = gg(a, b, c, d, X(9), 5, 568446438); d = gg(d, a, b, c, X(14), 9, -1019803690); c = gg(c, d, a, b, X(3), 14, -187363961); b = gg(b, c, d, a, X(8), 20, 1163531501);
    a = gg(a, b, c, d, X(13), 5, -1444681467); d = gg(d, a, b, c, X(2), 9, -51403784); c = gg(c, d, a, b, X(7), 14, 1735328473); b = gg(b, c, d, a, X(12), 20, -1926607734);
    a = hh(a, b, c, d, X(5), 4, -378558); d = hh(d, a, b, c, X(8), 11, -2022574463); c = hh(c, d, a, b, X(11), 16, 1839030562); b = hh(b, c, d, a, X(14), 23, -35309556);
    a = hh(a, b, c, d, X(1), 4, -1530992060); d = hh(d, a, b, c, X(4), 11, 1272893353); c = hh(c, d, a, b, X(7), 16, -155497632); b = hh(b, c, d, a, X(10), 23, -1094730640);
    a = hh(a, b, c, d, X(13), 4, 681279174); d = hh(d, a, b, c, X(0), 11, -358537222); c = hh(c, d, a, b, X(3), 16, -722521979); b = hh(b, c, d, a, X(6), 23, 76029189);
    a = hh(a, b, c, d, X(9), 4, -640364487); d = hh(d, a, b, c, X(12), 11, -421815835); c = hh(c, d, a, b, X(15), 16, 530742520); b = hh(b, c, d, a, X(2), 23, -995338651);
    a = ii(a, b, c, d, X(0), 6, -198630844); d = ii(d, a, b, c, X(7), 10, 1126891415); c = ii(c, d, a, b, X(14), 15, -1416354905); b = ii(b, c, d, a, X(5), 21, -57434055);
    a = ii(a, b, c, d, X(12), 6, 1700485571); d = ii(d, a, b, c, X(3), 10, -1894986606); c = ii(c, d, a, b, X(10), 15, -1051523); b = ii(b, c, d, a, X(1), 21, -2054922799);
    a = ii(a, b, c, d, X(8), 6, 1873313359); d = ii(d, a, b, c, X(15), 10, -30611744); c = ii(c, d, a, b, X(6), 15, -1560198380); b = ii(b, c, d, a, X(13), 21, 1309151649);
    a = ii(a, b, c, d, X(4), 6, -145523070); d = ii(d, a, b, c, X(11), 10, -1120210379); c = ii(c, d, a, b, X(2), 15, 718787259); b = ii(b, c, d, a, X(9), 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  return [a, b, c, d];
}

export function md5(str: string): string {
  const utf8 = unescape(encodeURIComponent(str));
  const x: number[] = [];
  for (let i = 0; i < utf8.length * 8; i += 8) x[i >> 5] |= (utf8.charCodeAt(i / 8) & 0xff) << i % 32;
  const out = core(x, utf8.length * 8);
  let hex = "";
  for (let i = 0; i < out.length * 32; i += 8) hex += ((out[i >> 5] >>> i % 32) & 0xff).toString(16).padStart(2, "0");
  return hex;
}

/** Imagem de um item ou criatura na TibiaWiki (carregada sem referrer). */
export function wikiImage(name: string, ext = "gif"): string {
  const file = `${name.trim().replace(/ /g, "_").replace(/^./, (c) => c.toUpperCase())}.${ext}`;
  const h = md5(file);
  return `https://static.wikia.nocookie.net/tibia/images/${h[0]}/${h.slice(0, 2)}/${encodeURIComponent(file)}/revision/latest?path-prefix=en`;
}
