import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("blogs", "year", {
    type: DataTypes.INTEGER,
    validate: {
      min: 1991,
      is: /\d{4}/,
    },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("blogs", "year", {});
};
