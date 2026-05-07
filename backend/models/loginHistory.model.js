module.exports = (sequelize, DataTypes) => {
  const LoginHistory = sequelize.define(
    "LoginHistory",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      loginAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "web",
      },
    },
    { timestamps: true }
  );

  return LoginHistory;
};
