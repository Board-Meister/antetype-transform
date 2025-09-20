import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Herald, ISubscriber, Subscriptions  } from "@boardmeister/herald"
import type { ModulesEvent } from "@boardmeister/antetype-core"
import type Transformer from "@src/module";
import type Marshal from "@boardmeister/marshal";
import { Event as AntetypeCoreEvent } from "@boardmeister/antetype-core"

export const ID = 'transform';
export const VERSION = '0.0.4';

export interface IInjected extends Record<string, object> {
  herald: Herald;
  marshal: Marshal;
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
    marshal: 'boardmeister/marshal',
    herald: 'boardmeister/herald',
  }
  inject(injections: IInjected): void {
    this.#injected = injections;
  }

  register(event: ModulesEvent): void {
    const { registration } = event.detail;

    registration[ID] = {
      load: async () => {
        if (!this.#module) {
          const module = this.#injected!.marshal.getResourceUrl(this as Module, 'module.js');
          this.#module = ((await import(module)) as { default: typeof Transformer }).default;
        }

        return (modules, canvas) => new this.#module!(canvas, modules, this.#injected!.herald);
      },
      version: VERSION,
    };
  }

  static subscriptions: Subscriptions = {
    [AntetypeCoreEvent.MODULES]: 'register',
  }
}

const EnAntetypeTransform: IInjectable<IInjected>&ISubscriber = AntetypeTransform;
export default EnAntetypeTransform;
