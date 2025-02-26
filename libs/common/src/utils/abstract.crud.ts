import mongoose, { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export class CrudService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    if (!model) {
      throw new Error("Model is required to initialize CrudService");
    }
    this.model = model;
  }

  async create(
    document: Partial<T>,
    options?: { session?: mongoose.ClientSession }
  ): Promise<T> {
    const createdDocument = new this.model(document);
    return await createdDocument.save({ session: options?.session });
  }

  async findOne(
    filterQuery: FilterQuery<T>,
    session?: mongoose.ClientSession
  ): Promise<T | null> {
    const document = await this.model
      .findOne(filterQuery)
      .session(session || null)
      .lean<T>(true);

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

  async updateOne(
    filterQuery: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session?: mongoose.ClientSession
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filterQuery, updateData, { new: true, session })
      .lean<T>(true);
  }
}
