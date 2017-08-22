var args = process.argv;
var action = process.argv[2];
var value =  process.argv[3];

//Required Modules
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var keys = require('./keys.js');

// Load the NPM Package inquirer
var inquirer = require("inquirer");

//Create an object of Twitter by passing the keys
var client = new Twitter(keys.twitterKeys);
var params = {
    screen_name: 'Paulocoelho',
    count: 20
};

//Credentials for Spotify
var spotify = new Spotify(keys.spotifyKeys);

var request = require('request');
var fs = require('fs');

// Create a "Prompt" with a series of questions.
inquirer
.prompt([
    // Here we create a basic text prompt.
    // Here we give the user a list to choose from.
    {
        type: "list",
        message: "What do you want to do?",
        choices: ["Get Twitter Feeds", "Know about Song", "Know about Movie", "You Decide"],
        name: "choices"
      },
      // Here we ask the user to confirm.
      {
        type: "confirm",
        message: "Are you sure?",
        name: "confirm",
        default: true
      }
    ])
    .then(function(inquirerResponse) {
        if (inquirerResponse.confirm) {
            choices(inquirerResponse.choices);
        }
        else {
            console.log("\nThat's okay come again when you are more sure.\n");
        }
    //    console.log(inquirerResponse.choices);
    });
  

//If statements for actions that you choose
function choices(action){
    if (action === "Get Twitter Feeds"){
        inquirer.prompt([
            {
                type: 'input',
                message: 'Give a handle to search for...',
                name: 'Name'
            }
        ]).then(function(response){
            myTweets(response);    
        });        
    } else if (action === "Know about Song"){
        inquirer.prompt([
            {
                type: 'input',
                message: 'Name the song to search for...',
                name: 'Name'
            }
        ]).then(function(response){
            spotifyThis(response.Name);    
        });
    } else if(action === "Know about Movie"){
        inquirer.prompt([
            {
                type: 'input',
                message: 'Name the movie to search for...',
                name: 'Name'
            }
        ]).then(function(response){
            omdbThis(response);    
        });
    } else if(action === "You Decide"){
        random();
    }
};

// my-tweets function
function myTweets(handle) {
    if(handle.Name !== ''){
        params.screen_name = handle.Name; 
    }
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error && response.statusCode == 200) {
            fs.appendFile('terminal.log', ('\n' + Date() + ' User: ' + handle.Name + '\n'), function(err) {
                if (err) throw err;
            });
            console.log(' ');
            console.log('Last 20 Tweets:')
            
            for (i = 0; i < tweets.length; i++) {
                var number = i + 1;
                console.log(' ');
                console.log([i + 1] + '. ' + tweets[i].text);
                console.log('Created on: ' + tweets[i].created_at);
                console.log(' ');
                fs.appendFile('terminal.log', ( [i+1] + '. ' + tweets[i].text + 
                '\nCreated On: ' + tweets[i].created_at+
                '\n'
                  ), function(err) {
                 if (err) throw err;
                 });
            }
            fs.appendFile('terminal.log', '===================================\n', function(err) {
                if (err) throw err;
            });
        }
    });
} // end myTweets function


//OMBD MOVIE REQUEST FUNCTION STARTS HERE

// Storing all of the arguments in an array for 
function omdbThis(value) {
    // variable for holding the movie name
    var movieName = ""; 
    var valueArr = value.Name.split(" "); 
    for (var i = 0; i < valueArr.length; i++) {
        if (i > 0 && i < valueArr.length) {
            movieName = movieName + "+" + valueArr[i];
        }
        else {
            movieName += valueArr[i];
        }
    }
    if(movieName === "")
        movieName = "Titanic"; //Default movie name to search

    //  request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece";

    request(queryUrl, function(error, response, body) {
        // If the request is successful
        if (!error && response.statusCode === 200) {
            console.log(' ');
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("ImdbRating: " + JSON.parse(body).imdbRating);
            if(typeof(JSON.parse(body).Ratings[1]) !== 'undefined')
                console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
            console.log(' ');
            
        }
    });
}//End of omdb Function

//Start of Spotify Function
function spotifyThis(value) {
    //console.log(value.Name);
    if (value == null) {
        value = 'computer love';
    }
    spotify
    .search({ type: 'track', query: value})
    .then(function(response) {
    
       console.log(' ');
       console.log("Artist: " + response.tracks.items[0].artists[0].name);
       console.log("song: " + response.tracks.items[0].name);
       console.log("Preview Url: " + response.tracks.items[0].preview_url);
       console.log("Album: " +response.tracks.items[0].album.name);
       console.log(' ');

       fs.appendFile('terminal.log', ( 'Artist: ' + response.tracks.items[0].artists[0].name + 
       '\nSong: ' + response.tracks.items[0].name +
        '\nPreview Link: ' + response.tracks.items[0].preview_url +
         '\nAlbum: ' + response.tracks.items[0].album.name+
         '\n===================================\n' 
         ), function(err) {
        if (err) throw err;
        });      
    })
    .catch(function(err) {
      console.log(err);
    });
} // end spotifyThis function

// random function
function random() {
    fs.readFile('random.txt', 'utf8', function(error, data) {
        if (error) {
            console.log(error);
        } else {
            var dataArr = data.split(',');
            if (dataArr[0] === 'spotify-this-song') {
                spotifyThis(dataArr[1]);
            }
        }
    });
} // end doWhatItSays function
