import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("reading_list", "read", {
    type: DataTypes.BOOLEAN,
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("reading_list", "read");
};
