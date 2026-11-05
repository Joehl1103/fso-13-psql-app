import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.renameTable("reading_list","reading_lists")
}

export const down = async ({ context: queryInterface }) => {
  await queryInterface.renameTable("reading_lists","reading_lists");
};
