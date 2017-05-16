const { authenticate } = require('feathers-authentication').hooks;
const { when, isNot, every, discard } = require('feathers-hooks-common');
const { restrictToRoles, restrictToOwner } = require('feathers-authentication-hooks');
const { hashPassword } = require('feathers-authentication-local').hooks;
const discardPrivateProps = [
  when(
    hook => hook.params.provider,
    discard('role'),
    discard('status')
  )
];
const firstUser = () => hook => {
  return hook.service.find({$limit: 1}).then(users => {
    if(users.total === 0) {
      hook.firstUser = true;
      hook.data.role = 'admin';
      hook.data.status = 'active';
    }
    return hook;
  });
};
const removeActivities = () => hook => {
  const activityService = hook.app.service('videoActivities');
  if(hook.type === 'before') {
    if(hook.method === 'remove') {
      var removePromises = [];
      return activityService.find({
        query: {
          userId: hook.id
        }
      }).then(res => {
        res.data.forEach(activity => {
          removePromises.push(activityService.remove(activity.id));
        });
        return Promise.all(removePromises).then(values => hook);
      });
    }
  }
};
const restrictExisting = [
  authenticate('jwt'),
  restrictToRoles({
    roles: ['admin'],
    fieldName: 'role',
    idField: 'id',
    ownerField: 'id',
    owner: true
  })
];
const restrict = [
  when(
    isNot(hook => hook.firstUser),
    authenticate('jwt'),
    restrictToRoles({
      roles: ['admin'],
      fieldName: 'role',
      idField: 'id',
      ownerField: 'id',
      owner: true
    })
  )
];
module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ ...restrictExisting ],
    create: [ firstUser(), ...restrict, hashPassword() ],
    update: [ ...restrict, hashPassword() ],
    patch: [ ...restrict, hashPassword() ],
    remove: [ ...restrict, removeActivities() ]
  },

  after: {
    all: [
      when(
        hook => hook.params.provider,
        discard('password')
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
