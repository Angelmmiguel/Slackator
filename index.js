let Bot = require('slackbots'),
  fs = require('fs'),
  U = require('./utils'),
  request = require('request'),
  config;

// Load config
config = JSON.parse(fs.readFileSync('./config.json'));

// create a bot
const settings = {
  token: config.slack.token,
  name: config.slack.name
};

// Initialize
const bot = new Bot(settings);
const users = {};

const getUser = (user) => {
  if (users[user] !== undefined) {
    return users[user];
  } else {
    console.error('The user is not defined');
  }
}

bot.on('start', () => {
  // define existing username instead of 'user_name'
  bot.getUsers().then(data => {
    data.members.forEach(u => {
      if (!u.is_bot) {
        users[u.id] = {
          id: u.id,
          name: u.name,
          real_name: u.real_name
        }
      }
    });
  });
});

const getUserPhab = (user) => {
  let promise = new Promise((resolve, reject) => {
    if (users[user.id].phid !== undefined) {
      resolve(users[user.id].phid);
    } else {
      request.post(`${config.phabricator.url}:${config.phabricator.port}/api/user.query`, {
        form: {
          'api.token': config.phabricator.token,
          'usernames': [user.name]
        }
      }, (err, res, body) => {
        let parsed = JSON.parse(body);
        if (!err) {
          users[user.id].phid = parsed.result[0].phid;
          resolve(users[user.id].phid);
        } else {
          reject(err);
        }
      });
    }
  });

  return promise;
}

// Default params
const params = { icon_url: config.phabricator.icon }

bot.on('message', (data) => {
  // Ignore non message events
  if (data.type !== 'message' || data.text === undefined || (data.subtype && data.subtype === 'bot_message')) { return; }

  console.log('DEBUG:');
  console.log(data);

  // Get user
  let user = getUser(data.user);

  // all ingoing events https://api.slack.com/rtm
  if (U.contains(data.text, ['hello', 'hi', 'hey'])){
    let text = `Hello *${user.real_name}*. How can I help you? You can try _check my revisions_`;
    // Respond
    bot.postMessageToUser(user.name, text, params);
  } else if (U.contains(data.text, ['my revisions', 'my diffs', 'my opened diffs'])) {
    // Get the data from phab!
    getUserPhab(user).then(phid => {
      request.post(`${config.phabricator.url}:${config.phabricator.port}/api/differential.query`, {
        form: {
          'api.token': config.phabricator.token,
          authors: [phid],
          status: 'status-open'
        }
      }, (err, res, body) => {
        if (!err) {
          let text = "Your opened diffs are: \n";
          let parsed = JSON.parse(body);

          parsed.result.forEach(diff => {
            let icon;

            switch (diff.status) {
              case "0":
                icon = ':white_circle:';
                break;
              case "1":
                icon = ':red_circle';
                break;
              default:
                icon = ':+1:'
            }

            text += `- ${icon} *${diff.title}* (${diff.uri})\n`
          });

          bot.postMessageToUser(user.name, text, params);
        } else {
          bot.postMessageToUser(user.name, 'Sorry, there was an error with your request: ' + err, params);
        }
      });
    });
  }
});
