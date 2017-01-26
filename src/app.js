/*************************************************************************                                                                     *
 * This app requires a config.js file in the path '/public/js/config.js' *
 ************************************************************************/

/*---------------------------------------
* Requires and variables
* ---------------------------------------*/
'use strict';

// Initial requires
var authKeys = require('./public/js/config.js');
var pd = require('./public/js/prettydate.js');
var express = require('express');

//Initial variables
var app = express();
var count = 5;
var tweets;
var friends;
var messages;
var username = 'brandon_ore';

// Define port
var port = process.env.PORT || 3000;

/*---------------------------------------
* Set up server and route(s)
* ---------------------------------------*/

// Static server
app.use('/static', express.static(__dirname + '/public'));

// Set view engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views');

// Set home route
app.get('/', function(req, res){
    // Render index.pug and pass through tweet, friends and messages data
    res.render('index', {tweets: tweets, friends: friends, messages: messages}); 
});

// Start server
app.listen(port, function(){
    console.log('The frontend server is running on port: ' + port);
});

/*---------------------------------------
* FUNCTIONS 
* ---------------------------------------*/

// Get timeline data
function getInfo(path, params) {
    return new Promise(function(resolve, reject){
        authKeys.T.get(path, params, function(error, data, response){
            if(!error && response.statusCode === 200) {
                resolve(data);
            } else {
               reject('There was an error getting the data. ' + error);
            }
        });
    });
}

// Parse 'created_at' date 
function parseDate(data) {
    if(data === tweets) {
        for(var i = 0; i < data.length; i++) {
            data[i].created_at = pd.prettyDate(data[i].created_at);
        }
        return data;
    } else {
        for(var i = 0; i < data.length; i++) {
            data[i].sender.created_at = pd.prettyDate(data[i].created_at);
        }
        return data;
    }   
}

/*---------------------------------------
* Call functions
* ---------------------------------------*/

// Get recent tweets
getInfo('statuses/user_timeline', {screen_name: username, count: count})
    .then(function(data){ 
        tweets = Object.keys(data).map(function(value){
            return data[value];
        });
        tweets = parseDate(tweets);
    }).catch(function(error){
        console.log(error);
    });

// Get recent friends
getInfo('friends/list', {screen_name: username, count: count})
    .then(function(data){
        friends = data;
    }).catch(function(error){
        console.log(error);
    });

// Get direct messages
getInfo('direct_messages', {screen_name: username, count})
    .then(function(data){
        messages = data;
        messages = parseDate(messages);
    }).catch(function(error){
        console.log(error);
    });



