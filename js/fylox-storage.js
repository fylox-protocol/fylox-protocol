// ═══════════════════════════════════════════════════
//  FYLOX STORAGE — Pi Browser localStorage fallback
// ═══════════════════════════════════════════════════

const FyloxStorage = {
  _mem: {},
  get(key) {
    try { return localStorage.getItem(key); } catch(e) { return this._mem[key] || null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, val); } catch(e) { this._mem[key] = val; }
  }
};
