// ../antetype-core/dist/index.js
var o = ((e) => (e.STRUCTURE = "antetype.structure", e.MIDDLE = "antetype.structure.middle", e.BAR_BOTTOM = "antetype.structure.bar.bottom", e.CENTER = "antetype.structure.center", e.COLUMN_LEFT = "antetype.structure.column.left", e.COLUMN_RIGHT = "antetype.structure.column.right", e.BAR_TOP = "antetype.structure.bar.top", e.MODULES = "antetype.modules", e))(o || {});
var i = ((a) => (a.INIT = "antetype.init", a.DRAW = "antetype.draw", a.CALC = "antetype.calc", a))(i || {});
var n = class {
  #t;
  #r = null;
  #e = null;
  static inject = { minstrel: "boardmeister/minstrel", herald: "boardmeister/herald" };
  inject(r) {
    this.#t = r;
  }
  async #a(r, t) {
    if (!this.#e) {
      let a = this.#t.minstrel.getResourceUrl(this, "core.js");
      this.#r = (await import(a)).default, this.#e = this.#r({ canvas: t, modules: r, injected: this.#t });
    }
    return this.#e;
  }
  async register(r) {
    let { modules: t, canvas: a } = r.detail;
    t.core = await this.#a(t, a);
  }
  async init(r) {
    if (!this.#e) throw new Error("Instance not loaded, trigger registration event first");
    let t = { type: "document", base: r.detail.base, layout: [], start: { x: 0, y: 0 }, size: { w: 0, h: 0 } };
    return t.layout = await this.#e.view.recalculate(t, t.base), await this.#e.view.redraw(t.layout), t;
  }
  static subscriptions = { [o.MODULES]: "register", "antetype.init": "init" };
};

// ../../tool/antetype/dist/index.js
var Event = /* @__PURE__ */ ((Event2) => {
  Event2["STRUCTURE"] = "antetype.structure";
  Event2["MIDDLE"] = "antetype.structure.middle";
  Event2["BAR_BOTTOM"] = "antetype.structure.bar.bottom";
  Event2["CENTER"] = "antetype.structure.center";
  Event2["COLUMN_LEFT"] = "antetype.structure.column.left";
  Event2["COLUMN_RIGHT"] = "antetype.structure.column.right";
  Event2["BAR_TOP"] = "antetype.structure.bar.top";
  Event2["MODULES"] = "antetype.modules";
  return Event2;
})(Event || {});

// src/index.tsx
var AntetypeTransform = class {
  #injected;
  #instance = null;
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
    this.#instance = modules.transform = new this.#module(canvas, modules, this.#injected);
  }
  condition(event) {
    const { element } = event.detail;
    if (element?.draw === false) {
      event.detail.element = null;
      event.stopPropagation();
    }
  }
  setTransform(event) {
    const { element } = event.detail;
    if (typeof element.transform != "object") {
      return;
    }
    const transform = element.transform;
    const typeToAction = {
      rotate: this.#instance.rotate.bind(this.#instance),
      opacity: this.#instance.opacity.bind(this.#instance),
      filter: this.#instance.filter.bind(this.#instance)
    };
    this.#instance.save();
    const el = typeToAction[transform.type] ?? null;
    if (typeof el == "function") {
      el(transform, element);
    }
  }
  restoreTransform(event) {
    const { element } = event.detail;
    if (typeof element.transform != "object") {
      return;
    }
    this.#instance.restore();
  }
  static subscriptions = {
    [Event.MODULES]: "register",
    [i.DRAW]: [
      {
        method: "setTransform",
        priority: -255
      },
      {
        method: "restoreTransform",
        priority: 255
      }
    ],
    [i.CALC]: {
      method: "condition",
      priority: -254
    }
  };
};
var EnAntetypeTransform = AntetypeTransform;
var src_default = EnAntetypeTransform;
export {
  AntetypeTransform,
  src_default as default
};
