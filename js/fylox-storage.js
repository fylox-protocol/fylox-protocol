// ═══════════════════════════════════════════════════
//  FYLOX STORAGE — v2
//  - _mem privado (no accesible externamente)
//  - Métodos: get, set, remove, clear
//  - Fallback seguro si Pi Browser bloquea localStorage
// ═══════════════════════════════════════════════════

const FyloxStorage = (() => {
  const _mem = new Map(); // privado — no accesible desde fuera del módulo

  return {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return _mem.has(key) ? _mem.get(key) : null;
      }
    },

    set(key, val) {
      try {
        localStorage.setItem(key, val);
      } catch {
        _mem.set(key, val);
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        _mem.delete(key);
      }
    },

    clear() {
      try {
        localStorage.clear();
      } catch {
        _mem.clear();
      }
    },
  };
})();
