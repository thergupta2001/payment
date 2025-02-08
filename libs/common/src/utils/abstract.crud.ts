import { Model, Document } from "mongoose";

export class CrudService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(document: Omit<T & { _id?: string }, "_id">): Promise<T> {
    const createdDocument = new this.model(document);
    return await createdDocument.save();
  }
}
