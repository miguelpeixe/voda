// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const videoActivities = sequelizeClient.define('videoActivities', {
    videoId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    clientId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    action: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    data: {
      type: Sequelize.JSON,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM(
        'open',
        'closed'
      ),
      defaultValue: 'open'
    },
    ip: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    statusCode: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    classMethods: {
      associate (models) {
        videoActivities.belongsTo(models.users);
        videoActivities.belongsTo(models.videos);
      }
    }
  });

  return videoActivities;
};
