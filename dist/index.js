// ../antetype-core/dist/index.js
var s = ((t) => (t.INIT = "antetype.init", t.CLOSE = "antetype.close", t.DRAW = "antetype.draw", t.CALC = "antetype.calc", t.RECALC_FINISHED = "antetype.recalc.finished", t.MODULES = "antetype.modules", t.SETTINGS = "antetype.settings.definition", t))(s || {});

// src/index.tsx
var AntetypeTransform = class {
  #injected;
  #module = null;
  static inject = {
    minstrel: "boardmeister/minstrel",
    herald: "boardmeister/herald"
  };
  inject(injections) {
    this.#injected = injections;
  }
  async register(event) {
    const { modules, canvas } = event.detail;
    if (!this.#module) {
      const module = this.#injected.minstrel.getResourceUrl(this, "module.js");
      this.#module = (await import(module)).default;
    }
    modules.transform = new this.#module(canvas, modules, this.#injected.herald);
  }
  static subscriptions = {
    [s.MODULES]: "register"
  };
};
var EnAntetypeTransform = AntetypeTransform;
var src_default = EnAntetypeTransform;
export {
  AntetypeTransform,
  src_default as default
};
