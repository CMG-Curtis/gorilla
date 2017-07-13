var http = new XMLHttpRequest();

var url = 'https://umggaming.com/tournaments/1862/teams';

http.open('GET', url);
http.setRequestHeader('Origin', url);
http.setRequestHeader('User-Agent','Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0');
http.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		// Typical action to be performed when the document is ready:
		console.log();
	}
};
http.send();