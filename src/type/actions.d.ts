import { ITransform } from "@src/index";

export type IRotate = ITransform<{ degree: number }>

export type IOpacity = ITransform<{ alpha: number }>

export type IFilter = ITransform<{ filter: string }>
