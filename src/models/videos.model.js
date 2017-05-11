// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const videos = sequelizeClient.define('videos', {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    path: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT
    },
    privacy: {
      type: Sequelize.ENUM(
        'public',
        'private'
      )
    },
    status: {
      type: Sequelize.ENUM(
        'waiting',
        'uploading',
        'uploaded'
      ),
      defaultValue: 'waiting'
    },
    recordedAt: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    classMethods: {
      associate (models) {
        videos.hasMany(models.videoActivities);
      }
    }
  });

  return videos;
};
