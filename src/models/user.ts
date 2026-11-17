import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import type { Blog } from "./index.ts"

import { sequelize } from "../db/utils/db.ts";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare name: string;
  declare password: string;
  declare blogs?: NonAttribute<Blog[]>;
  declare readings?: NonAttribute<Blog[]>;
  declare disabled: boolean;
  /**NOTE: assigned type string so that it could be compatible with the response from API in src/controllers/userController/userHelpers.ts in getUserUserIdToBlogMap
  */
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "user",
  },
);

export default User;
