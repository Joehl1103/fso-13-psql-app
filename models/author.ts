import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../util/db.js";

class Author extends Model<
  InferAttributes<Author>,
  InferCreationAttributes<Author>
> {
  declare id: CreationOptional<number>;
  declare author: string;
  declare blogs: number;
  declare likes: number;
}

Author.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    blogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "author",
  },
);

export default Author;
