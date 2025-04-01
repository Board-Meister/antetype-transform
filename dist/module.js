// ../antetype-core/dist/index.js
var s = ((t) => (t.INIT = "antetype.init", t.CLOSE = "antetype.close", t.DRAW = "antetype.draw", t.CALC = "antetype.calc", t.RECALC_FINISHED = "antetype.recalc.finished", t.MODULES = "antetype.modules", t.SETTINGS = "antetype.settings.definition", t))(s || {});

// src/module.tsx
var Transformator = class {
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
        event: s.CLOSE,
        subscription: () => {
          unregister();
        }
      },
      {
        event: s.DRAW,
        subscription: [
          {
            method: (event) => {
              const { element } = event.detail;
              if (typeof element.transform != "object") {
                return;
              }
              const transform = element.transform;
              const typeToAction = {
                rotate: this.rotate.bind(this),
                opacity: this.opacity.bind(this),
                filter: this.filter.bind(this)
              };
              this.save();
              const el = typeToAction[transform.type] ?? null;
              if (typeof el == "function") {
                el(transform, element);
              }
            },
            priority: -255
          },
          {
            method: (event) => {
              const { element } = event.detail;
              if (typeof element.transform != "object") {
                return;
              }
              this.restore();
            },
            priority: 255
          }
        ]
      },
      {
        event: s.CALC,
        subscription: {
          priority: -254,
          method: (event) => {
            const { element } = event.detail;
            if (element?.draw === false) {
              event.detail.element = null;
              event.stopPropagation();
            }
          }
        }
      }
    ]);
  }
  save() {
    this.#ctx.save();
  }
  restore() {
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
  Transformator as default
};
