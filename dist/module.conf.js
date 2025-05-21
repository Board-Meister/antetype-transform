// node_modules/@boardmeister/antetype-core/dist/index.js
var u = { INIT: "antetype.init", CLOSE: "antetype.close", DRAW: "antetype.draw", CALC: "antetype.calc", RECALC_FINISHED: "antetype.recalc.finished", MODULES: "antetype.modules", SETTINGS: "antetype.settings.definition", TYPE_DEFINITION: "antetype.layer.type.definition", FONTS_LOADED: "antetype.font.loaded" };

// src/module.conf.ts
var AntetypeTransform = class {
  #injected;
  #module = null;
  static inject = {
    marshal: "boardmeister/marshal",
    herald: "boardmeister/herald"
  };
  inject(injections) {
    this.#injected = injections;
  }
  async register(event) {
    const { modules, canvas } = event.detail;
    if (!this.#module) {
      const module = this.#injected.marshal.getResourceUrl(this, "module.js");
      this.#module = (await import(module)).default;
    }
    modules.transform = new this.#module(canvas, modules, this.#injected.herald);
  }
  static subscriptions = {
    [u.MODULES]: "register"
  };
};
var EnAntetypeTransform = AntetypeTransform;
var module_conf_default = EnAntetypeTransform;
export {
  AntetypeTransform,
  module_conf_default as default
};
