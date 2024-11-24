// src/index.ts

import ORM from "./orm";
import { DataTypes } from "./dataTypes";
import { Config, ModelSchema } from "./types";

const ormInstance = new ORM();

export const initialize = ormInstance.initialize.bind(ormInstance);
export const defineModel = ormInstance.defineModel.bind(ormInstance);
export { DataTypes };
export type { Config, ModelSchema };
