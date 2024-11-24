// src/models/mongoModel.ts

import {
  Collection,
  Db,
  ChangeStream,
  ChangeStreamDocument,
  ObjectId,
  Filter,
} from "mongodb";
import ORM from "../orm";
import { ModelSchema } from "../types";

class MongoModel<T extends { _id: any }> {
  private name: string;
  private schema: ModelSchema;
  private orm: ORM;
  private collection: Collection<T>;

  constructor(name: string, schema: ModelSchema, orm: ORM) {
    this.name = name;
    this.schema = schema;
    this.orm = orm;
    this.collection = this.orm.mongoDb!.collection<T>(this.name);

    this.setupChangeStream();
  }

  private setupChangeStream(): void {
    const changeStream: ChangeStream = this.collection.watch([], {
      fullDocument: "updateLookup",
    });

    changeStream.on("change", (change: ChangeStreamDocument<T>) => {
      const operationType = change.operationType.toUpperCase();
      let documentData: any;

      if (change.operationType === "insert" && change.fullDocument) {
        documentData = change.fullDocument;
      } else if (change.operationType === "delete" && change.documentKey) {
        // En caso de eliminación, podemos usar `documentKey` para obtener el ID del documento eliminado
        documentData = { _id: change.documentKey._id };
      } else {
        // Si no tenemos `fullDocument`, manejamos el caso adecuadamente
        console.warn(
          "fullDocument no está disponible para esta operación:",
          change.operationType
        );
        return;
      }

      const payload = {
        model: this.name,
        operation: operationType,
        data: documentData,
      };

      this.orm.broadcast("databaseUpdate", payload);
    });
  }

  private mapDataTypes(data: any): any {
    const mappedData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        this.schema[key]?.type === "INTEGER" ||
        this.schema[key]?.type === "FLOAT"
      ) {
        mappedData[key] = Number(value);
      } else if (this.schema[key]?.type === "BOOLEAN") {
        mappedData[key] = Boolean(value);
      } else {
        mappedData[key] = value;
      }
    }
    return mappedData;
  }

  public async create(data: Partial<T>): Promise<T> {
    const mappedData = this.mapDataTypes(data);
    const result = await this.collection.insertOne(mappedData as any);
    const insertedDocument = await this.findById(result.insertedId);
    return insertedDocument!;
  }

  public async findAll(criteria: Partial<T> = {}): Promise<T[]> {
    const cursor = this.collection.find(criteria as any as Filter<T>);
    const results = await cursor.toArray();
    return results as T[];
  }

  public async findById(id: any): Promise<T | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.findOne({ _id: objectId });
    return result ? (result as T) : null;
  }

  public async update(id: any, data: Partial<T>): Promise<T | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const mappedData = this.mapDataTypes(data);
    await this.collection.updateOne({ _id: objectId }, { $set: mappedData });
    const updatedDocument = await this.findById(objectId);
    return updatedDocument;
  }

  public async delete(id: any): Promise<T | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const documentToDelete = await this.findById(objectId);
    if (documentToDelete) {
      await this.collection.deleteOne({ _id: objectId });
      return documentToDelete;
    } else {
      return null;
    }
  }
}

export default MongoModel;
