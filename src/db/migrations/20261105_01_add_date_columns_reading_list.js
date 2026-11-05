import { DataTypes,QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }) => {

  await queryInterface.addColumn('reading_lists','created_at',{
    type: DataTypes.DATE,
    allowNull: false
  });

  await queryInterface.addColumn('reading_lists','updated_at',{
    type: DataTypes.DATE,
    allowNull: false
  });
};

export const down = async ({ context: queryInterface }) => {

  await queryInterface.removeColumn('reading_lists','created_at',{
    type: DataTypes.DATE,
    allowNull: false
  });

  await queryInterface.removeColumn('reading_lists','updated_at',{
    type: DataTypes.DATE,
    allowNull: false
  });
};
