module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
      groupName: DataTypes.STRING,
      joinCode: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      startDate: {
          type: DataTypes.DATE,
          allowNull: true,
      },
      endDate: {
          type: DataTypes.DATE,
          allowNull: true,
      },
      activityId: DataTypes.INTEGER,
      userId: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {});

  return Group;
};
