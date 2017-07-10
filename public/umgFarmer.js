console.log(JSON.stringify(Database));

var u = new User('example', 'someWebsite', 'aRegion',['PS4','PC'],[],'twitterHandle', 800, 'twitchUsername', 65, 'youtubeUsername', 10);

Database.post(Database.users, u);