'use strict'

var app = require('../../server/server')

module.exports = function (Auth) {
  Auth.isInRole = function (accessToken, roleToCheck, cb) {
    let RoleMapping = app.models.RoleMapping
    let Role = app.models.Role
    let AccessToken = app.models.AccessToken

    // First find the user based on the Access Token that is passed in
    AccessToken.findById(accessToken, function (err, success) {
      if (err) {
        cb(err)
      } else {
        // Once we have the user, now we can find the roles the user belong to by finding all the role mappings
        RoleMapping.find({ where: { principalId: success.userId } }, function (err, roleMapping) {
          if (err) {
            cb(err)
          } else {
            if (roleMapping && roleMapping.length > 0) {
              let checked = 0
              let isInRole = false
              // Loop over all the roles the user belongs to
              for (let mapping of roleMapping) {
                // And find the name of the role, to match against the requested role being checked.
                Role.findById(mapping.roleId, function (err, role) {
                  checked++
                  if (err) {
                    cb(err)
                  } else {
                    if (!isInRole && role.name === roleToCheck) {
                      isInRole = true
                    }
                  }
                  if (checked >= roleMapping.length) {
                    cb(null, { isInRole: isInRole })
                  }
                })
              }
            } else {
              cb(null, { isInRole: false })
            }
          }
        })
      }
    })
  }
}
