const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

const { hashPassword } = require('feathers-authentication-local').hooks;
const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: 'id',
    ownerField: 'id'
  })
];
const discardPrivateProps = [
  commonHooks.when(
    hook => hook.params.provider,
    commonHooks.discard('role'),
    commonHooks.discard('status')
  )
];

const firstUser = () => hook => {
  return hook.service.find({$limit: 1}).then(users => {
    if(users.total === 0) {
      hook.data.role = 'admin';
      hook.data.status = 'active';
    }
    return hook;
  });
};

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ ...restrict ],
    create: [ ...discardPrivateProps, firstUser(), hashPassword() ],
    update: [ ...restrict, ...discardPrivateProps, hashPassword() ],
    patch: [ ...restrict, ...discardPrivateProps, hashPassword() ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
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
