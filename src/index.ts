import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions  } from "@boardmeister/herald"
import type { ModulesEvent } from "@boardmeister/antetype-core"
import type Transformer from "@src/module";
import { Event as AntetypeCoreEvent } from "@boardmeister/antetype-core"

export interface IInjected extends Record<string, object> {
  minstrel: Minstrel;
  herald: Herald;
}

export interface ITransform<T = any> {
  type: string;
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
  #module: (typeof Transformer)|null = null;

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
    modules.transform = new this.#module!(canvas, modules, this.#injected!.herald);
  }

  static subscriptions: Subscriptions = {
    [AntetypeCoreEvent.MODULES]: 'register',
  }
}

const EnAntetypeTransform: IInjectable<IInjected>&ISubscriber = AntetypeTransform;
export default EnAntetypeTransform;
