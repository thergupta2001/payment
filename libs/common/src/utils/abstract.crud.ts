import mongoose, { Model, Document, FilterQuery } from "mongoose";

export class CrudService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    if (!model) {
      throw new Error("Model is required to initialize CrudService");
    }
    this.model = model;
  }

  async create(
    document: Omit<T & { _id?: string }, "_id">,
    options?: { session?: mongoose.ClientSession }
  ): Promise<T> {
    const createdDocument = new this.model(document);
    return await createdDocument.save({ session: options?.session });
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    const document = await this.model.findOne(filterQuery).lean<T>(true);
    return document || null;
  }

  async findOneById(id: string): Promise<T | null> {
    const document = await this.model.findById(id).lean<T>(true);
    return document || null;
  }

  async deleteOneById(
    id: mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
  ): Promise<T | null> {
    return this.model.findByIdAndDelete(id, { session }).lean<T>(true);
  }
}
