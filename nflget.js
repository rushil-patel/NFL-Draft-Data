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
						if(td.getElementsByTagName("a").length !== 0) {
							var endPoint = td.getElementsByTagName("a")[0].getAttribute("href");
							//add players into link dictionary
							playerLinks[name] = endPoint;
							console.log(name);
						} else {
							//players who dont have a link, no data 
							console.log(name);
						}


					}
				}//console.log(Object.keys(playerLinks)[Object.keys(playerLinks).length-1]);
			}

			// for(var player in playerLinks) {
			// 	if (playerLinks.hasOwnProperty(player)) {
			// 		collectStats(base + playerLinks[player]);
			// 	}
			// }
			collectStats(base+"/players/J/JohnTr20.htm", "Johnson, Travis");
		}
	};
xhr.send();


function collectStats(playerPage, playerName) {
	var xhr2 = new XMLHttpRequest();
	xhr2.open('GET',playerPage,"false");
	xhr2.responseText = "document";
	xhr2.onreadystatechange = function() {
		if (xhr2.readyState == 4 && xhr2.status == 200) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr2.responseText, "text/html");
			var table;
			if($(doc.getElementById('passing'))[0]) {
				table = $(doc.getElementById('passing'))[0];
				console.log(1);
			}
			else if($(doc.getElementById('rushing_and_receiving'))[0]) {
				table = $(doc.getElementById('rushing_and_receiving'))[0];
								console.log(2);
 
			}
			else if($(doc.getElementById('receiving_and_rushing'))[0]) {
				table = $(doc.getElementById('receiving_and_rushing'))[0];
								console.log(3);

			}
			else if($(doc.getElementById('defense'))[0]) {
				table = $(doc.getElementById('defense'))[0];
								console.log(4);

			}
			else if($(doc.getElementById('returns'))[0]) {
				table = $(doc.getElementById('returns'))[0];
								console.log(5);
			}

			console.log(table);
			//Get number of rows/columns
			var rowLength = table.rows.length;
			var colLength = table.rows[0].cells.length;
			//Declare string to fill with table data
			var tableString = "";

			//Get column headers
			for (var i = 0; i < colLength; i++) {
			    tableString += table.rows[0].cells[i].innerHTML.split(",").join("") + ",";
			}

			tableString = tableString.substring(0, tableString.length - 1);
			tableString += "\r\n";

			//Get row data
			for (var j = 1; j < rowLength; j++) {

			    for (var k = 0; k < colLength; k++) {

			    	//skip career rows and rows following the carrer row
			    	if(table.rows[j].cells[k].innerHTML == "Career") {
			    		//if the Career row is being read skip to the end
			    		k = colLength;
			    		j = rowLength;
			    		break;
			    	}
			    	//if there at anchors extract the anchor text
			    	else if(table.rows[j].cells[k].getElementsByTagName('a')[0]) {
			    		tableString += table.rows[j].cells[k].getElementsByTagName('a')[0].innerHTML.split(",").join("") + ",";
			    	}
			    	//simply add text to the csv string 
			    	else {

			    		tableString += table.rows[j].cells[k].innerHTML.split(",").join("") + ",";
			    	}
			    }

			    tableString += "\r\n";
			}

			download(tableString, playerName+".csv", 'text/csv');
		}
	};
	xhr2.send();
}


function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */



    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}


