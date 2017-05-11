const { authenticate } = require('feathers-authentication').hooks;
const { restrictToRoles } = require('feathers-authentication-hooks');
const hydrate = require('feathers-sequelize/lib/hooks/hydrate');
const dehydrate = require('feathers-sequelize/lib/hooks/dehydrate');
const { when, disallow, populate } = require('feathers-hooks-common');
const errors = require('feathers-errors');

const restrictGet = [
  authenticate('jwt'),
  restrictToRoles({
    roles: ['admin'],
    fieldName: 'role',
    idField: 'id'
  })
];

const restrictEdit = [
  disallow('external')
];

const populateSchema = {
  service: 'videoActivities',
  include: [
    {
      service: 'users',
      nameAs: 'user',
      parentField: 'userId',
      childField: 'id'
    },
    {
      service: 'videos',
      nameAs: 'video',
      parentField: 'videoId',
      childField: 'id'
    }
  ]
};

module.exports = {
  before: {
    all: [
      // hook => {
      //   const sequelize = app.get('sequelizeClient');
      //   hook.params.sequelize = {
      //     include: []
      //   }
      // }
    ],
    find: [ ...restrictGet ],
    get: [ ...restrictGet ],
    create: [ ...restrictEdit ],
    update: [ ...restrictEdit ],
    patch: [ ...restrictEdit ],
    remove: [ ...restrictEdit ]
  },

  after: {
    all: [
      dehydrate(),
      populate({ schema: populateSchema })
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
