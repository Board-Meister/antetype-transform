import type { ICore } from "@boardmeister/antetype-core";
import Core from "@boardmeister/antetype-core/src/core";
import { Herald } from "@boardmeister/herald";
import Transformer from "@src/module";

describe('Transformer is', () => {
  let transformer: Transformer, core: ICore;
  const herald = new Herald();
  const canvas = document.createElement('canvas');
  beforeEach(() => {
    core = Core({ herald, canvas }) as ICore;
    transformer = new Transformer(canvas, { core }, herald );
  });

  it('properly rotating, changing opacity and setting filter', async () => {
    const ctx = canvas.getContext('2d')!;
    const getRotationInt = () =>  {
      const mat = ctx.getTransform();
      console.log(mat.b, mat.a);

      return Math.round(Math.atan2(mat.b, mat.a) * (180 / Math.PI));
    }
    transformer.opacity({
      type: 'opacity',
      data: {
        alpha: .1
      },
    });
    expect(ctx.globalAlpha).toBe(.1);

    transformer.filter({
      type: 'filter',
      data: {
        filter: 'blur(0)'
      },
    });
    expect(ctx.filter).toBe('blur(0)');

    transformer.rotate({
      type: 'rotate',
      data: {
        degree: 30
      },
    }, {
      type: 'test',
      size: {
        w: 0,
        h: 0,
      },
      start: {
        x: 0,
        y: 0,
      },
    });
    expect(getRotationInt()).toBe(30);
  });
});