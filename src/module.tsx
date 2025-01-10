import type { Modules } from "@boardmeister/antetype";
import type { IBaseDef } from "@boardmeister/antetype"
import { IInjected } from "@src/index";
import { IFilter, IOpacity, IRotate } from "@src/type/actions.d";

export default class Transformator {
  #canvas: HTMLCanvasElement;
  // @ts-expect-error TS6133: '#modules' is declared but its value is never read.
  #modules: Modules;
  #ctx: CanvasRenderingContext2D;
  // @ts-expect-error TS6133: '#injected' is declared but its value is never read.
  #injected: IInjected;

  constructor(
    canvas: HTMLCanvasElement|null,
    modules: Modules,
    injected: IInjected,
  ) {
    if (!canvas) {
      throw new Error('[Antetype Illustrator] Provided canvas is empty')
    }
    this.#canvas = canvas;
    this.#modules = modules;
    this.#injected = injected;
    this.#ctx = this.#canvas.getContext('2d')!;
  }

  save(): void {
    this.#ctx.save();
  }

  restore(): void {
    this.#ctx.restore();
  }

  rotate(transform: IRotate, layer: IBaseDef): void {
    const { start: { x,y }, size: { w,h } } = layer;
    this.#ctx.translate(x + w/2, y + h/2);
    this.#ctx.rotate((transform.data.degree * Math.PI) / 180);
    this.#ctx.translate(-(x + w/2), -(y + h/2));
  }

  opacity(transform: IOpacity): void {
    this.#ctx.globalAlpha = transform.data.alpha;
  }

  /**
   * @TODO rethink this, taking into account UI for settings filters: each filter will be entered independently
   *       with its own value (could be joined during calc event), so single "string" holder seems insufficient and hard
   *       to use
   * @param transform
   */
  filter(transform: IFilter): void {
    this.#ctx.filter = transform.data.filter;
  }
}
