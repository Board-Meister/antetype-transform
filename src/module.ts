import { IFilter, IOpacity, IRotate } from "@src/type/actions.d";
import type { Herald  } from "@boardmeister/herald"
import type { DrawEvent, IBaseDef, Modules } from "@boardmeister/antetype-core"
import { Event as AntetypeCoreEvent } from "@boardmeister/antetype-core"
import type { ITransform } from "@src/type/type.d";

export default class Transformer {
  #modules: Modules;
  #herald: Herald;

  constructor(
    modules: Modules,
    herald: Herald,
  ) {
    this.#modules = modules;
    this.#herald = herald;
  }

  registerEvents(): void {
    const unregister = this.#herald.batch([
      {
        event: AntetypeCoreEvent.CLOSE,
        subscription: () => {
          unregister();
        }
      },
      {
        event: AntetypeCoreEvent.DRAW,
        subscription: [
          {
            method: (event: CustomEvent<DrawEvent>): void => {
                const { element } = event.detail;
                if (!Array.isArray(element.transforms)) {
                  return;
                }

                const transforms = element.transforms as ITransform[];
                const typeToAction: Record<string, (transform: ITransform, layer: IBaseDef) => void> = {
                  rotate: this.rotate.bind(this),
                  opacity: this.opacity.bind(this),
                  filter: this.filter.bind(this),
                };

                this.#save();
                transforms.forEach(transform => {
                  const el = typeToAction[transform.type] ?? null;
                  if (typeof el == 'function') {
                    el(transform, element);
                  }
                });
              },
            priority: -255
          },
          {
            method: (event: CustomEvent<DrawEvent>): void => {
              const { element } = event.detail;
              if (typeof element.transform != 'object') {
                return;
              }
              this.#restore();
            },
            priority: 255
          }
        ]
      },
    ])
  }

  #ctx(): CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D {
    const canvas = this.#modules.core!.meta.getCanvas();
    if (!canvas) {
      throw new Error('[Antetype Transform] Provided canvas is empty')
    }

    return canvas.getContext('2d')!;
  }

  #save(): void {
    this.#ctx().save();
  }

  #restore(): void {
    this.#ctx().restore();
  }

  rotate(transform: IRotate, layer: IBaseDef): void {
    const { start: { x,y }, size: { w,h } } = layer;
    this.#ctx().translate(x + w/2, y + h/2);
    this.#ctx().rotate((transform.data.degree * Math.PI) / 180);
    this.#ctx().translate(-(x + w/2), -(y + h/2));
  }

  opacity(transform: IOpacity): void {
    this.#ctx().globalAlpha = transform.data.alpha;
  }

  /**
   * @TODO rethink this, taking into account UI for settings filters: each filter will be entered independently
   *       with its own value (could be joined during calc event), so single "string" holder seems insufficient and hard
   *       to use
   * @param transform
   */
  filter(transform: IFilter): void {
    this.#ctx().filter = transform.data.filter;
  }
}
