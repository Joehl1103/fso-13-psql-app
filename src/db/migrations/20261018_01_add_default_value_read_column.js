import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("reading_list", "read", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("reading_list", "read", {
    type: DataTypes.BOOLEAN,
  });
};
