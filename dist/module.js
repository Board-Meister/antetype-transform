// src/module.tsx
var Transformator = class {
  #canvas;
  // @ts-expect-error TS6133: '#modules' is declared but its value is never read.
  #modules;
  #ctx;
  // @ts-expect-error TS6133: '#injected' is declared but its value is never read.
  #injected;
  constructor(canvas, modules, injected) {
    if (!canvas) {
      throw new Error("[Antetype Illustrator] Provided canvas is empty");
    }
    this.#canvas = canvas;
    this.#modules = modules;
    this.#injected = injected;
    this.#ctx = this.#canvas.getContext("2d");
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
