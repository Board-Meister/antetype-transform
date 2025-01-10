// ../../tool/antetype/dist/index.js
var Event = /* @__PURE__ */ ((Event2) => {
  Event2["STRUCTURE"] = "antetype.structure";
  Event2["DRAW"] = "antetype.draw";
  Event2["CALC"] = "antetype.calc";
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
    [Event.DRAW]: [
      {
        method: "setTransform",
        priority: -255
      },
      {
        method: "restoreTransform",
        priority: 255
      }
    ],
    [Event.CALC]: {
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
