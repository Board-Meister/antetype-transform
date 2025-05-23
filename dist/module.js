// node_modules/@boardmeister/antetype-core/dist/index.js
var u = { INIT: "antetype.init", CLOSE: "antetype.close", DRAW: "antetype.draw", CALC: "antetype.calc", RECALC_FINISHED: "antetype.recalc.finished", MODULES: "antetype.modules", SETTINGS: "antetype.settings.definition", TYPE_DEFINITION: "antetype.layer.type.definition", FONTS_LOADED: "antetype.font.loaded" };

// src/module.ts
var Transformer = class {
  #canvas;
  // @ts-expect-error TS6133: '#modules' is declared but its value is never read.
  #modules;
  #ctx;
  #herald;
  constructor(canvas, modules, herald) {
    if (!canvas) {
      throw new Error("[Antetype Illustrator] Provided canvas is empty");
    }
    this.#canvas = canvas;
    this.#modules = modules;
    this.#ctx = this.#canvas.getContext("2d");
    this.#herald = herald;
  }
  registerEvents() {
    const unregister = this.#herald.batch([
      {
        event: u.CLOSE,
        subscription: () => {
          unregister();
        }
      },
      {
        event: u.DRAW,
        subscription: [
          {
            method: (event) => {
              const { element } = event.detail;
              if (!Array.isArray(element.transforms)) {
                return;
              }
              const transforms = element.transforms;
              const typeToAction = {
                rotate: this.rotate.bind(this),
                opacity: this.opacity.bind(this),
                filter: this.filter.bind(this)
              };
              this.#save();
              transforms.forEach((transform) => {
                const el = typeToAction[transform.type] ?? null;
                if (typeof el == "function") {
                  el(transform, element);
                }
              });
            },
            priority: -255
          },
          {
            method: (event) => {
              const { element } = event.detail;
              if (typeof element.transform != "object") {
                return;
              }
              this.#restore();
            },
            priority: 255
          }
        ]
      }
    ]);
  }
  #save() {
    this.#ctx.save();
  }
  #restore() {
    this.#ctx.restore();
  }
  rotate(transform, layer) {
    const { start: { x, y }, size: { w, h } } = layer;
    this.#ctx.translate(x + w / 2, y + h / 2);
    this.#ctx.rotate(transform.data.degree * Math.PI / 180);
    this.#ctx.translate(-(x + w / 2), -(y + h / 2));
  }
  opacity(transform) {
    this.#ctx.globalAlpha = transform.data.alpha;
  }
  /**
   * @TODO rethink this, taking into account UI for settings filters: each filter will be entered independently
   *       with its own value (could be joined during calc event), so single "string" holder seems insufficient and hard
   *       to use
   * @param transform
   */
  filter(transform) {
    this.#ctx.filter = transform.data.filter;
  }
};
export {
  Transformer as default
};
