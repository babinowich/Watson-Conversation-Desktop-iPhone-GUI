# Watson Conversation Desktop iPhone GUI

## Overview
A web-interface for short-tail & long-tail chatbot with tone 

To see a native iOS version of this application, check out this repo here:
>Coming soon!

# Required Services

This Accelerator requires the following:

- Watson Conversation
- Watson Discovery Service
- Watson Tone Analyzer

# Description
This Watson Accelerator framework combines Watson Conversation, Watson Discovery, and Watson Tone Analyzer to allow for the creation an empathetic chatbot in the pixel dimensions of an iPhone 6+ to simulate what such a chatbot could look like on a mobile interface.

The Accelerator comes with a predefined sample set of Customers and Orders Data that are used within the application to represent the use case.  The app retrieves customer data from a Cloudant database that can be modified to represent a unique story or can use the provided predefined sample. Find this in `data/sampleCust.json`.

The Accelerator also has a prebuilt Conversation Workspace that can be used to jump-start this retail use case of order status inquiry. Find this in `data/WISMOworkspace.json`.

# Prerequisites

## Local Deployment
To make changes, you'll probably want to deploy locally to compile updates as you code.

### Node and NPM
Install 'node.js' -- This application requires at least version 7.9.x.  To get current LTS, you can get the download from [here](https://nodejs.org/en/download/current/).  This will give you `npm` and `node`.

### Loopback CLI (optional)
Install 'loopback-cli' globally so you can use the 'lb' commands for models/etc:
```
npm install -g loopback-cli
```

## IBM Cloud Deployment
To make changes, you'll probably want to deploy locally to compile updates as you code.

### Bluemix CLI
Follow the instructions on the [IBM Bluemix Cloud CLI page](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html) to download and install the Bluemix CLI.


### Cloudfoundry CLI 
To deploy the application and manage services from the command line using cloud foundry, you would need this CLI.  You can use the 

Follow the instructions on the [Cloudfoundry CLI page](https://github.com/cloudfoundry/cli#downloads) to download and install the CF CLI.

```
cf api https://api.ng.bluemix.net

cf login -u yourEmail@email.com -o yourIBMcloudOrg -s yourTargetedSpace

cf push app-name

```

# Setup Instructions
The high-level steps to get this application running is as follows;

1. Provision required Watson Services.
2. Create a trained Conversation workspace.
3. Upload documents to a Discovery collection and train query results if necessary.
4. Hookup Watson services to the application server.

## Provision Watson Services & Create Node.js 
Once the dependencies are installed, create your Bluemix services for this accelerator. Accelerators do NOT come with Watson services for you to bind to.  You must create and provision your own that you bind.

Services needed:
- Watson Conversation
- Watson Discovery Service
- Watson Tone Analyzer

On your IBM Cloud Dashboard, click the Blue Create Resource Button and scroll to Watson, creating one instance of each service above. If you have a service already provisioned, you can Bind to that same instance.

You'll also need to create a Cloud Foundry Application.  Select SDK for Node.js under Platform, Cloud Foundry Apps in the Create Resource menu.

Give the Application a name.  Take note of the name! You'll need this for the last step.

The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

## Watson Conversation Configuration
Create your Watson Conversation instance on IBM Cloud then design and build your Intents, Entities, and Dialog Flows per your use case.

Check out this [link](https://console.bluemix.net/docs/services/conversation/getting-started.html) for a helpful tutorial on getting started with Watson Conversation.

You can add Intents, Entities, and Dialog Flows to your workspace as you'd like.  Remember, free instances only allow for 15 Intents per workspace.

### Configuring Your Workspace to Accept Watson Tone Analyzer Context
The model created for Watson Tone Analyzer in /common/models/tone.js outputs the following object:

```
{ lastPredom: 'frustrated',
  lastPredomConf: 0.6875,
  lastUtterance:
   { utterance_id: 1,
     utterance_text: 'f*** you',
     tones: [ [Object] ] },
  columnData:
   [ [ 'sad', 0, 0 ],
     [ 'frustrated', 0, 0.6875 ],
     [ 'excited', 0, 0 ],
     [ 'satisfied', 0, 0 ],
     [ 'impolite', 0, 0 ],
     [ 'sympathetic', 0, 0 ],
     [ 'polite', 1, 0 ] ],
  allAnalysis:
   [ { utterance_id: 0, utterance_text: 'hi', tones: [Array] },
     { utterance_id: 1, utterance_text: 'f*** you', tones: [Array] } ] }
```

This Tone Object is formatted to show the Last Predominant Emotion in `lastPredom` along with the confidence in `lastPredomConf`.  If you are planning to show the data in a timeseries fashion (i.e. chart) you can use the `columnData` attribute.  The raw output from the Tone Analyzer service is appended in an array under `allAnalysis`.

The pre-built Conversation service on the client side in /client/src/app/chat/conversation.service.ts appends this Tone Object to the context object for Watson Conversation.  This then allows you to handle the Tone in your Conversation dialog flow with conditional triggers.  For example, at the top of a Dialog Flow set a condition to "if lastPredom == 'frustrated' && 'lastPredomConf > 0.7" then say "Hey looks like this conversation isn't going too well!".

For example, take a look at the following two conversations with the same intent, but phrased differently:

![](./data/polite.png)

![](./data/sad.png)

You can see the /client/src/app/chat/chat-bubble has conditional logic looking for bad tones, and changes the color of the bubble to red.

Another option for integrating Tone Analyzer with Conversation is to infuse your client side components with similar logic, bypassing Conversation altogether and thereby allowing a call to an external API such as one that hooks up to a live agent. This framework has some of that logic mocked up here in the /client/src/app/chat/chat.component.ts component, on line 133.  You can see we look for a specific threshold of Frustration and intercept our sending to Conversation with a response that says "Im sorry it looks like this conversation isnt going too well."  You can remove this and shift that logic into your dialog flow, or keep the logic on your app as this has here.


## Watson Discovery Service Configuration
Create your Watson Discovery Instance on IBM Cloud then design your configuration and select enrichments as needed for your use case.  

For tips and procedures on uploading documents to Discovery and features of the tooling, take a look at this [link](https://console.bluemix.net/docs/services/discovery/getting-started-tool.html) here.

For help with the API itself, check out this [link](https://console.bluemix.net/docs/services/discovery/getting-started.html).

You may find that you'll want to perform Relevancy Training to improve the results of your Natural Lanaguage Query.

### Configuring Your Workspace to Call to Discovery When Needed
Just like integrating Tone Analyzer above, there are multiple ways to call out to Discovery for a long-tail (infrequent or unscripted) question.

You can add a catchall intent in your Dialog Flow logic in Watson Conversation such as #LONG_TAIL trained with a few examples of long tail utterances and have an output Object in the response from Conversation flag the call.  For instance `output.call_discovery` == true.  This framework follows this paradigm as you can see on /client/src/app/chat/chat.component.ts line 199.

For more information on this method of calling Discovery for a long-tail question, check out this [blog](https://developer.ibm.com/recipes/tutorials/customized-watson-conversation-output/).

Another method is using Dialog Actions inside the Dialog Flow itself as shown [here](https://console.bluemix.net/docs/services/conversation/dialog-actions.html#dialog-actions).

## Hook Up Watson Services
For each service, open the instance up in IBM Cloud Dashboard and click on your newly created Node.js application.

1. Click on the Connect existing button.
2. Search for the service you would like to bind to.
3. Bind it to your application.
4. Re-stage the application.

### The Local VCAP file

The vcap-local.json file consist of your Bluemix service credentials when you run the application locally.

This file must be updated with your service credentials before the application can be executed.

1. On the Bluemix Application page, select the Connections option on the left.
2. Click the three dots menu on the right side of each Service bound to your application. Click View Crednentials If you don't see the services, you didn't bind right.  Take a look again at the Hook Up Watson Services section to make sure you did this.
3. Copy the credentials using the 'copy' icon.
4. Edit the vcap-local.json file.
5. Paste the content of the clipboard into the vcap.local file.
6. The structure of this file consists of a service name and a json object, but the pasted value is wrapped in another ```{ }``` that should be removed.
7. A sample of what it should look like below;

```
{
  "discovery": [
    {
      "credentials": {
        ...
      },
      "syslog_drain_url": null,
      "label": "discovery",
      "provider": null,
      "plan": "Lite",
      "name": "Discovery Lite em1",
      "tags": [
        "data_management",
        "ibm_created",
        "ibm_dedicated_public"
      ]
    }
  ],
  "conversation": [
    {
      ...
    }
  ]
}
```

Great! All connected and ready to go.

# Test and Develop Locally

To run the application locally (your own computer), you have to install additional Node.js modules and configure the application with some credentials that is provisioned on Bluemix.
There are a few quick steps required to stand up the application. In general, the required tasks are.

1. Install the server and client dependencies
2. Commission the required services (should be all done if you followed the above section)
3. Configure the environment variables in manifest.yml (cloud deployment) or .env (local deployment)
4. Build and run or deploy

## Installing the server and client dependencies
The server dependencies are controlled and defined in [the main package.json](./package.json).

The client dependencies are controlled and defined in [the client package.json](./client/package.json).

To install all required dependencies to both build the application and execute the application, execute the following script from the project root.

```
npm install
```

## Commission the required services (done in step 2)
You already did this! Congrats!

## Configure the environment variables
Open the `manifest.yml` file and change the `name` and `host` values to your application name. This is IMPORTANT as it must have a unique name for your own application.  WISMO is a taken name.

The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

For your environment variables, make sure you configure your env-vars.json file to pull credentials from your vcap-local.json that you created in the earlier step.  Use the example-env-vars.json as a template.  The file uses regular expressions to pull the credentials from the vcap-local.json file, that way we're not writing them in two spaces for local and Bluemix use!

## Build Run & Deploy Locally

### Development Mode:

Once all the credentials are in place, the application can be started with
```
npm run develop
```

This mode will build and serve the complete application and will rebuild and restart when it detects changes to the source. Issue the following command to start the application in development mode. Additionally, the browser will automatically refresh on changes.

Follow the prompts in Terminal/Command Line to access your local host.  This server starts on port 3000.

### Standard Mode:

This mode will build and serve the complete application but it will not rebuild and restart when it detects changes to the source. Issue the following command to start the application in standard mode:

```
npm run serve
```

Follow the prompts in Terminal/Command Line to access your local host.  This server starts on port 3000.

### Accessing the Application

When you run the application locally or on Bluemix, you will be prompted for a username and password when you load the application in a browser.

- Log into the application using the credentials username = ```watson``` and password = ```p@ssw0rd```.

- You can modify this my editing the file settings/user_registry to add, modify or remove credentials.

- At least 1 set of credentials is required


## Deploy to IBM Cloud
Open the `manifest.yml` file and make you you have changed the `name` and `host` values to your application name. This is IMPORTANT as it must have a unique name for your own application.


2. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf login -a https://api.ng.bluemix.net
  ```
3. Push the app to Bluemix, but don't start it yet.  We would need to bind the services to the new application before starting it up.

  ```
  $ cf push
  ```

4. The application should now be running on Bluemix.  You can access the application URL using the application name you defined in the manifest.yml file with a '.mybluemix.net' appended to it.

7. The application is secured with a username and password.

8. Continue to the next step to do some additional configuration within the application.

# Contributing

Please do contribute! Fork, add an issue, and I'd be happy to take a look at it.

Remember that the main purpose of this application is for rapid prototyping and not for scalable production instances.  Components may be used for such uses, but the entire application as is does not have production-ready code in it.  The focus here is on readibility, reusability, and for a demonstration of what can be done with these Watson services.