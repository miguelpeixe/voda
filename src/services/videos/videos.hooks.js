const { authenticate } = require('feathers-authentication').hooks;
const { restrictToRoles } = require('feathers-authentication-hooks');
const { when, isNot, every, replaceItems } = require('feathers-hooks-common');
const errors = require('feathers-errors');

const removePrivate = () => hook => {
  if(hook.type === 'after') {
    if(hook.method === 'find') {
      replaceItems(hook, hook.result.data.filter(current => current.privacy === 'public' ));
    } else if(hook.method === 'get') {
      if(
        hook.result.privacy &&
        current.privacy !== 'public'
      ) {
        throw new errors.Forbidden('You are not authorized to access this content');
      }
    }
  }
  return hook;
};

const restrictPrivate = [
  when(
    every(
      hook => !hook.params.user,
      hook => hook.params.provider
    ),
    removePrivate()
  )
];

const restrictEdit = [
  authenticate('jwt'),
  restrictToRoles({
    roles: ['admin', 'publisher'],
    fieldName: 'role',
    idField: 'id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ ...restrictEdit ],
    update: [ ...restrictEdit ],
    patch: [ ...restrictEdit ],
    remove: [ ...restrictEdit ]
  },

  after: {
    all: [ ...restrictPrivate ],
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
