import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions  } from "@boardmeister/herald"
import type { DrawEvent, IBaseDef, CalcEvent } from "@boardmeister/antetype-core"
import type { ModulesEvent } from "@boardmeister/antetype"
import type Transformator from "@src/module";
import { Event as AntetypeCoreEvent } from "@boardmeister/antetype-core"
import { Event as AntetypeEvent } from "@boardmeister/antetype"

export interface IInjected extends Record<string, object> {
  minstrel: Minstrel;
  herald: Herald;
}

export interface ITransform<T = any> {
  type: 'string';
  data: T;
}

/**
 * Manages transformation techniques like:
 * - opacity
 * - rotation
 * - canvas filter
 * and additionally stops the drawing for certain elements (draw = false)
 */
export class AntetypeTransform {
  #injected?: IInjected;
  #instance: Transformator|null = null;
  #module: (typeof Transformator)|null = null;

  static inject = {
    minstrel: 'boardmeister/minstrel',
    herald: 'boardmeister/herald',
  }
  inject(injections: IInjected): void {
    this.#injected = injections;
  }

  async register(event: CustomEvent<ModulesEvent>): Promise<void> {
    const { modules, canvas } = event.detail;
    if (!this.#module) {
      const module = this.#injected!.minstrel.getResourceUrl(this as Module, 'module.js');
      this.#module = (await import(module)).default;
    }
    this.#instance = modules.transform = new this.#module!(canvas, modules, this.#injected!);
  }

  condition(event: CustomEvent<CalcEvent>): void {
    const { element } = event.detail;
    if (element?.draw === false) {
      event.detail.element = null;
      event.stopPropagation();
    }
  }

  setTransform(event: CustomEvent<DrawEvent>): void {
    const { element } = event.detail;
    if (typeof element.transform != 'object') {
      return;
    }

    const transform = element.transform as ITransform;
    const typeToAction: Record<string, (transform: ITransform, layer: IBaseDef) => void> = {
      rotate: this.#instance!.rotate.bind(this.#instance),
      opacity: this.#instance!.opacity.bind(this.#instance),
      filter: this.#instance!.filter.bind(this.#instance),
    };

    this.#instance!.save();
    const el = typeToAction[transform.type] ?? null;
    if (typeof el == 'function') {
      el(transform, element);
    }
  }

  restoreTransform(event: CustomEvent<DrawEvent>): void {
    const { element } = event.detail;
    if (typeof element.transform != 'object') {
      return;
    }
    this.#instance!.restore();
  }

  static subscriptions: Subscriptions = {
    [AntetypeEvent.MODULES]: 'register',
    [AntetypeCoreEvent.DRAW]: [
      {
        method: 'setTransform',
        priority: -255
      },
      {
        method: 'restoreTransform',
        priority: 255
      }
    ],
    [AntetypeCoreEvent.CALC]: {
      method: 'condition',
      priority: -254,
    },
  }
}

const EnAntetypeTransform: IInjectable&ISubscriber = AntetypeTransform;
export default EnAntetypeTransform;
