var base = "http://www.pro-football-reference.com"
var links = [
	"http://www.pro-football-reference.com/years/2005/draft.htm",
	"http://www.pro-football-reference.com/years/2004/draft.htm",
	"http://www.pro-football-reference.com/years/2003/draft.htm",
	"http://www.pro-football-reference.com/years/2002/draft.htm",
	"http://www.pro-football-reference.com/years/2001/draft.htm",
	"http://www.pro-football-reference.com/years/2000/draft.htm",
	"http://www.pro-football-reference.com/years/1999/draft.htm",
	"http://www.pro-football-reference.com/years/1998/draft.htm",
	"http://www.pro-football-reference.com/years/1997/draft.htm",
	"http://www.pro-football-reference.com/years/1996/draft.htm",
	"http://www.pro-football-reference.com/years/1995/draft.htm"
]
var playerLinks = {};

var xhr =  new XMLHttpRequest();

var link = links[0];
	console.log(link);
	xhr.open('GET',link,"false");
	xhr.responseText = "document";
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var trs = doc.getElementsByTagName("tr");
			for(var tr in trs) {

				//hides the prototype method in "trs" collection
				if(trs.hasOwnProperty(tr)) {


					var td = trs[tr].getElementsByTagName("td")[3];

					//"td" will be undefined when "trs[tr]" is a table header. In this case "trs[tr]" will
					//only contain "th" not "td". Ignoring these "tr" is fine behavior as they dont contain 
					//desired data.
					if(td !== undefined) {
						var name = td.getAttribute("csk");
						//if there is a link to get then continue
						if(td.getElementsByTagName("a").length != 0) {
							var endPoint = td.getElementsByTagName("a")[0].getAttribute("href");
							//add players into link dictionary
							playerLinks[name] = endPoint;

						}

					}
				}console.log(Object.keys(playerLinks)[Object.keys(playerLinks).length-1]);

			}

		}
	};
xhr.send();

