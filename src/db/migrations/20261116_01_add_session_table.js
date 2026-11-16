import { DataTypes, QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('sessions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('sessions');
};
