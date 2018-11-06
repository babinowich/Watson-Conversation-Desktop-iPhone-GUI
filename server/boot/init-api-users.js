'use strict'

const LOG = require('../utils/logger')

module.exports = function (app, done) {
  var ApiUser = app.models.ApiUser
  var Role = app.models.Role
  var RoleMapping = app.models.RoleMapping
  var AccessToken = app.models.AccessToken

  var defaultUsers = [
    { username: 'vmware', email: 'watson@vmware.com', password: 'vmw@rer0cks' },
      { username: 'watson', email: 'watson@ibm.com', password: 'w@ts0n' },
      { username: 'admin', email: 'admin@ibm.com', password: '@dm1n!', roles: [ 'admin' ] }
  ]

  var defaultRoles = [
    { name: 'admin' }
  ]

  init()

  async function init() {
    // Create all the Users
    for (let user of defaultUsers) {
      await checkAndCreateUser(user).then(checkedUser => {
        LOG.info(checkedUser.username + ' - User OK')
      })
    }
    // Create all the Roles
    for (let role of defaultRoles) {
      await checkAndCreateRole(role).then(checkedRole => {
        LOG.info(checkedRole.name + ' - Role OK')
      })
    }
    // Add the Users to the specified Roles.
    for (let user of defaultUsers) {
      if (user.roles && user.roles.length > 0) {
        for (let userRole of user.roles) {
          await checkAndCreatePrincipal(userRole, user.username).then(checkPrincipals => {
            LOG.info('User ' + user.username + ' is part of Role ' + userRole + ' - OK')
          })
        }
      }
    }
    done()
  }

  // Function that will be called each time a user logs in.  This function will
  // clean the old tokens from the mem_db.json file.
  ApiUser.beforeRemote('login', function (ctx, modelInstance, next) {
    try {
      AccessToken.find({ where: { userId: modelInstance.id } }, (err, existing) => {
        if (!err) {
          if (existing.length > 0) {
            for (let token of existing) {
              let now = new Date()
              let created = new Date(token.created)
              let alive = (now - created) / 1000
              if (alive > 3600) {
                AccessToken.destroyById(token.id, (err, deleted) => {
                  if (err) {
                    LOG.error(err)
                  } else {
                    LOG.warn('Removing expired token for user.')
                  }
                })
              }
            }
          }
        }
      })
    } catch (err) {
      LOG.error(err)
    }
    next()
  })

  // Check if a user already exist, if not, create one.
  function checkAndCreateUser (user) {
    try {
      return new Promise((resolve, reject) => {
        ApiUser.findOne({ where: { username: user.username } }, async (err, existing) => {
          if (err || !existing) {
            await createUser(user).then(created => {
              resolve(created)
            })
          } else {
            resolve(existing)
          }
        })
      })
    } catch (err) {
      throw err
    }
  }

  // Create a new User
  function createUser (user) {
    try {
      return new Promise((resolve, reject) => {
        ApiUser.create(user, (err, created) => {
          if (err) {
            reject(err)
          } else {
            LOG.debug('A new API User was created with username: ' + user.username)
            resolve(created)
          }
        })
      })
    } catch (err) {
      throw err
    }
  }

  // Check if a Role already exist, if not, create one.
  function checkAndCreateRole (role) {
    try {
      return new Promise((resolve, reject) => {
        Role.findOne({ where: { name: role.name } }, async (err, existing) => {
          if (err || !existing) {
            await createRole(role).then(created => {
              resolve(created)
            })
          } else {
            resolve(existing)
          }
        })
      })
    } catch (err) {
      throw err
    }
  }

  // Create a Role
  function createRole (role) {
    try {
      return new Promise((resolve, reject) => {
        Role.create(role, async (err, created) => {
          if (err) {
            reject(err)
          } else {
            LOG.debug('A new Role was created: ' + role.name)
            resolve(created)
          }
        })
      })
    } catch (err) {
      throw err
    }
  }

  function checkAndCreatePrincipal(roleName, userName) {
    try {
      return new Promise((resolve, reject) => {
        ApiUser.findOne({ where: { username: userName } }, async (err, user) => {
          if (err || !user) {
            reject('Trying to add a principal to a none-existing user ' + userName + '!!!')
          } else {
            Role.findOne({ where: { name: roleName } }, async (err, role) => {
              if (err || !role) {
                reject('Trying to add a principal to a none-existing role!!!')
              } else {
                role.principals.findOne({ principalId: user.id }, (err, existing) => {
                  if (err || !existing) {
                    createPrincipal(role, user.id).then(created => {
                      resolve(created)
                    })    
                  } else {
                    resolve(existing)
                  }
                })
              }
            })
          }
        })
      })
    } catch (err) {
      throw err
    }
  }

  // Create a Principal
  function createPrincipal (role, userId) {
    try {
      return new Promise((resolve, reject) => {
        LOG.debug('Adding user with ID ' + userId + ' to Role ' + role.name)
        role.principals.create({ principalType: RoleMapping.USER, principalId: userId }, (err, created) => {
          if (err) {
            reject(err)
          } else {
            resolve(created)
          }
        })
      })
    } catch (err) {
      throw err
    }
  }
}
