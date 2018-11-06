'use strict'

const cfenv = require('cfenv')
const fs = require('fs')

const LOG = require('./logger')

const VCAP_LOCAL_JSON_FILE = './vcap-local.json'
const ENV_VARS_JSON_FILE = './env-vars.json'
const INIT_LOG_LEVEL = 'debug'

let appEnv

module.exports = function () {
    
    let vcapLocalDefault = {}
    let envVarsDefault = {
        LOG_LEVEL: 'debug'
    }

    LOG.silly('Initializing the Environment')

    // If running locally, load the VCAP from the vcap-local.json file.
    if (isLocal) {
        LOG.debug('App is executing locally...')
        // Read the local config files
        var vcapLocalJson = readConfigFile(VCAP_LOCAL_JSON_FILE)
        if (!vcapLocalJson) {
            vcapLocalJson = vcapLocalDefault
        }
        // Create a local VCAP object
        var envOptions = {
            vcap: { services: vcapLocalJson }
        }
        // Set the appEnv for everything to use
        appEnv = cfenv.getAppEnv(envOptions)

        LOG.debug('VCAP environment successfully created from local config file...')
    } else {
        // Let cfenv handle loading the VCAP
        appEnv = cfenv.getAppEnv()
    }
    var envVarsLocalJson = readConfigFile(ENV_VARS_JSON_FILE)
    if (!envVarsLocalJson) {
        envVarsLocalJson = envVarsDefault
    }
    resolveEnvironmentFromVcap(envVarsLocalJson)

    LOG.silly('Environment successfully configured.')
    
    // Update the log level to the level defined in the env-var.json file.
    if (process.env.LOG_LEVEL) {
        LOG.info('Log level is set to ' + (process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'silly') + ', it can be changed as an environment variable.')        
        LOG.level = process.env.LOG_LEVEL
    }
    
    return {
        getAppEnv: function () {
            return appEnv
        }
    }
}()

function resolveEnvironmentFromVcap(envVarsLocalJson) {
    // Loop over the defined fields in the local-env.json file
    for (var valName in envVarsLocalJson) {
        LOG.debug('Resolving environment variable ' + valName)
        // If it's an object, it indicates that we need to extract it from vcap
        if (typeof envVarsLocalJson[valName] === 'object' && !Array.isArray(envVarsLocalJson[valName])) {
            handleExpressionVariable(valName, envVarsLocalJson[valName])
        } else {
            // If it's an array, then serialize the array into the process.env variable.
            if (Array.isArray(envVarsLocalJson[valName])) {
                handleArrayVariable(valName, envVarsLocalJson)
            } else {
                // Otherwise load the variable as is.
                handleBasicVariables(valName, envVarsLocalJson)
            }
        }
    }
}

function handleBasicVariables(valName, envVarsLocalJson) {
    // Prefer to get literal values from appEnv otherwise default to value in the env-vars.json file
    if (process.env[valName]) {
        LOG.debug('Found an expression variable ' + valName + ' in the environment, using it.')
        return
    }
    process.env[valName] = envVarsLocalJson[valName]
}

function handleArrayVariable(valName, envVarsLocalJson) {
    if (process.env[valName]) {
        LOG.debug('Found an expression variable ' + valName + ' in the environment, using it.')
        return
    }
    process.env[valName] = JSON.stringify(envVarsLocalJson[valName])
}

function handleExpressionVariable(valName, expressionVar) {
    // If there is an environment variable set with this valName, use that above anything else.
    if (process.env[valName]) {
        LOG.debug('Found an expression variable ' + valName + ' in the environment, using it.')
        return
    }
    var expr = expressionVar.expr
    var field = expressionVar.field
    var append = expressionVar.append
    var re = new RegExp(expr)
    var json = appEnv.getService(re)
    // If the field is an array then we want to extract all the values
    // and use the valuePattern to build the value
    var val = getValue(valName, json, field)
    if (val) {
        // If something needs to be appended to the value from the vcap
        if (append) {
            process.env[valName] = val + append
        } else {
            process.env[valName] = val
        }
    } else {
        let err = 'Field could not be set for ' +
            valName + ' because ' +
            field + ' could not be found in json'
        throw err
    }
}

// Function that will navigate to a specific dot notation field
// in the json and return the value
function getValue(valName, json, path) {
    try {
        var _path = path.split('.')

        var cur = json
        _path.forEach(function (field) {
            if (cur[field]) {
                cur = cur[field]
            }
        })

        return cur
    } catch (err) {
        throw 'Error trying to extract ' + valName + ' from VCAP LOCAL'
    }
}

function isLocal() {
    return !process.env.VCAP_SERVICES
}

// Short utility function to read in JSON config file.
function readConfigFile(filename) {
    try {
        var parsedJSON
        if (fs.existsSync(filename)) {
            parsedJSON = JSON.parse(fs.readFileSync(filename, 'utf8'))
        } else {
            LOG.warn('There don\'t seem to be a ' + filename + ' available.')
            return null
        }
        return parsedJSON
    } catch (err) {
        LOG.warn('There seem to be a problem reading file ' + filename + '.')
        return null
    }
}