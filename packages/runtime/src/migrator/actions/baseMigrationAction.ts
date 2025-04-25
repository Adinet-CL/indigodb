export abstract class BaseMigrationAction {
  constructor(public table: string) {}
  abstract toJSON(): object;
}

export type SerializedMigrationAction = ReturnType<BaseMigrationAction['toJSON']>