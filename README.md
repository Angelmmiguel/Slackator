# Slackator

> **NOTE:** This project is under heavy development

Slackator is a conversational bot to connect [Slack](slack.com) with [Phabricator](https://www.phacility.com/). The goal of this bot is managing the basic operations in Phabricator and displaying relevan information for users.

# Config

The bot requires a `config.json` file to work. You can use [config.json.example](https://github.com/Angelmmiguel/Slackator/blob/master/config.json.example) as an example.

To get the Slack API token, you need to register a new bot in the [Custom Integrations](https://my.slack.com/apps/manage/custom-integrations) section of your Team. You can get the Phabricator token in your _Setting / Conduit API Tokens_ section.

# Run

To run the server you only need to install the node dependencies and start the project:

```
npm install && npm start
```

# License

Slackator is released under the GPL-3.0 license. Copyright [@Laux_es](https://twitter.com/laux_es) ;)
