export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  find<T>(model: string, query: object): Promise<T[]>;
  findFirst<T>(model: string, query: object): Promise<T | null>;
  findById<T>(model: string, id: string): Promise<T | null>;

  create<T>(model: string, data: Partial<T>): Promise<T>;
  update<T>(model: string, id: string, data: Partial<T>): Promise<T>;
  delete(model: string, id: string): Promise<boolean>;

  count(model: string, query: object): Promise<number>;

  runRawQuery?<T = unknown>(query: string | object, params?: any[]): Promise<T>;
  transaction?<T>(callback: () => Promise<T>): Promise<T>;
}
