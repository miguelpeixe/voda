// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {

    name: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    role: {
      type: Sequelize.ENUM(
        'admin',
        'publisher',
        'subscriber'
      ),
      defaultValue: 'subscriber'
    },
    status: {
      type: Sequelize.ENUM(
        'pending',
        'active'
      ),
      defaultValue: 'pending'
    }


  }, {
    classMethods: {
      associate (models) {
        users.hasMany(models.videoActivities);
      }
    }
  });

  return users;
};
