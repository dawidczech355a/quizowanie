import { Model } from "mongoose";

import { CategoryInterface } from "./schema";

export class CategoryService {
  constructor(
    private readonly categoryModel: Model<CategoryInterface>
  ) {}

  async find() {
    const categories = await this.categoryModel.find();

    return categories;
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id);

    return category;
  }

  async findByIds(ids: string[]) {
    const categories = await Promise.all(ids.map(async id => {
      return await this.findById(id);
    }));

    return categories;
  }
}
