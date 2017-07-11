var username = document.getElementById('username');
var password = document.getElementById('password');
var collection = document.getElementById('collection');
var query = document.getElementById('query');
var submit = document.getElementById('submit');
var data = document.getElementById('data');

submit.addEventListener('click', function(){
	Database.getDocuments(username.value, password.value, collection.value, JSON.parse(query.value), function(response){
		data.innerHTML = JSON.stringify(response);
	});
});

var user1 = new User('curtis','umg','NA',['XB1', 'PS4'],[],'tweeter',300);

Database.insertDocument(username.value, password.value, collection.value, user1, function(response){
	data.innerHTML = JSON.stringify(response);
});