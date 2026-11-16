import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('sessions','active', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('sessions','active');
};
