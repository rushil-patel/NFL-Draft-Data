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
							playerLinks[endPoint] = endPoint;
							console.log(name);
						} else {
							//players who dont have a link, no data 
							console.log(name);
						}


					}
				}//console.log(Object.keys(playerLinks)[Object.keys(playerLinks).length-1]);
			}

			var numPlayers = playerLinks.length;
			var endpoints = Object.keys(playerLinks);

			//3 second delay between each download
			(function myLoop (i) {          
			   setTimeout(function () {   
      				collectStats(base+endpoints[i], playerLinks[endpoints[i]]);                         
      				if (--i >=0) myLoop(i);
   				}, 3000)
			})(2);
		}
	};
xhr.send();


function collect(url, name) {
	setTimeout(collectStats(url, name), 3000);
}

function collectStats(playerPage, playerName) {
	var xhr2 = new XMLHttpRequest();
	xhr2.open('GET',playerPage,"false");
	xhr2.responseText = "document";
	xhr2.onreadystatechange = function() {
		if (xhr2.readyState == 4 && xhr2.status == 200) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr2.responseText, "text/html");
			var table;

			var allTables = doc.getElementsByTagName("table");
			console.log(allTables);

			for (table in allTables){
				if (allTables.hasOwnProperty(table)){
					if(allTables[table].id == "passing") {
						table = allTables[table];
						console.log(1);
						break;
					}
					else if(allTables[table].id == 'rushing_and_receiving') {
						table = allTables[table];
						console.log(2);
		 				break;
					}
					else if(allTables[table].id == 'receiving_and_rushing') {
						table = allTables[table];
						console.log(3);
						break;

					}
					else if(allTables[table].id == 'defense') {
						table = allTables[table];
						console.log(4);
						break;

					}
					else if(allTables[table].id == 'returns') {
						table = allTables[table];
						console.log(5);
						break;
					}
				}
			}
			
			console.log(table);
			//Get number of rows/columns
			var numRows = table.rows.length;

			var numCols = table.rows[0].cells.length;
			//Declare string to fill with table data
			var tableString = "";

			//Get column headers
			var row = 1;
			if(table.id == 'passing') {
				row = 0;
			}
			for (var i = 0; i < table.rows[row].cells.length; i++) {
			    tableString += table.rows[row].cells[i].innerHTML.split(",").join("") + ",";

			}
			console.log(tableString);

			tableString = tableString.substring(0, tableString.length - 1);
			tableString += "\r\n";

			//Get row data
			exitLoop:
			for (var j = row + 1; j < numRows; j++) {

			    for (var k = 0; k < table.rows[j].cells.length; k++) {

			    	//skip career rows and rows following the carrer row
			    	if(table.rows[j].cells[k].innerHTML == "Career") {
			    		//if the Career row is being read skip to the end
			    		break exitLoop;
			    	}
			    	//if there at anchors extract the anchor text
			    	else if(table.rows[j].cells[k].getElementsByTagName('a')[0]) {
			    		tableString += table.rows[j].cells[k].getElementsByTagName('a')[0].innerHTML.split(",").join("") + ",";
			    	}
			    	else if(k===0 && table.rows[j].cells[0].innerHTML === ''){
			    		var preValue = table.rows[j-1].cells[k].innerHTML;
			    		table.rows[j].cells[k].innerHTML = preValue;
			    		tableString += preValue.split(",").join("") + ",";
			    	}
			    	else if(table.rows[j].cells[k].textContent !== undefined) {
			    		tableString += table.rows[j].cells[k].textContent.split(",").join("") + ",";
			    	}

			    	//simply add text to the csv string 
			    	else {
			    		tableString += table.rows[j].cells[k].innerHTML.split(",").join("") + ",";
			    	}
			    }

			    tableString += "\r\n";
			}
			console.log(tableString);
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