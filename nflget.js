var base = "http://www.pro-football-reference.com";
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
];
var playerLinks = {};
var tableString = getTableHeader();
var xhr =  new XMLHttpRequest();
var linkIdx = links.length-1;

function scrape() {  
	console.log(linkIdx+"..");
	if(linkIdx >= 0) {
		collectPlayers(links[linkIdx--]);
    }
    else if (linkIdx-- == -1) {
    	download(tableString, "PlayerData.csv", 'text/csv');
		return;
    }
}

function collectPlayers(link) {
	xhr.open('GET',link,"false");
	xhr.responseText = "document";
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var trs = doc.getElementsByTagName("tr");
			var year = doc.getElementsByTagName("h1")[0].textContent.split(" ")[0];

			for(var tr in trs) {

				//hides the prototype method in "trs" collection
				if(trs.hasOwnProperty(tr) && trs[tr].getElementsByTagName("td").length > 0 ){


					var td = trs[tr].getElementsByTagName("td")[3];
					rnd = trs[tr].getElementsByTagName("td")[0].textContent;
					pck = trs[tr].getElementsByTagName("td")[1].textContent;
					//"td" will be undefined when "trs[tr]" is a table header. In this case "trs[tr]" will
					//only contain "th" not "td". Ignoring these "tr" is fine behavior as they dont contain 
					//desired data.
					if(td !== undefined) {
						var name = td.getAttribute("csk");
						//if there is a link to get then continue
						if(td.getElementsByTagName("a").length !== 0) {
							var endPoint = td.getElementsByTagName("a")[0].getAttribute("href");
							//add players into link dictionary
							playerLinks[endPoint] = [name, year, rnd, pck];
							//console.log(name);
						} else {
							//players who dont have a link, no data 
							//console.log(name);
						}


					}
				}//console.log(Object.keys(playerLinks)[Object.keys(playerLinks).length-1]);
			}

			var numPlayers = Object.keys(playerLinks).length -1;
			var endpoints = Object.keys(playerLinks);
			console.log(numPlayers);
			//3 second delay between each download
			(function myLoop (i) {          
			   setTimeout(function () {  
			   		console.log(i);
			   		if(i == -1) {
			   			playerLinks = {};
			   			console.log("scraping again");
			   			scrape();
			   		} else {
      					collectStats(base+endpoints[i], playerLinks[endpoints[i]][0], playerLinks[endpoints[i]][1], playerLinks[endpoints[i]][2],playerLinks[endpoints[i]][3]);
      					if (--i >=-1) myLoop(i);
      				}
   				}, 1500)
			})(numPlayers-1);
		}
	};
	xhr.send();
}

function getTableHeader() {
	var tableHeader = "Name, UID,";

	tableHeader = "Name,UID,Year,Age,Tm,Pos,No.,G,GS,QBrec,Cmp,Att,Cmp%,Yds,TD,TD%,Int,Int%,Lng,Y/A,AY/A,Y/C,Y/G,Rate,QBR,Sk,Yds,NY/A,ANY/A,Sk%,4QC,GWD,"+
				  "RUSH_Att,RUSH_Yds,RUSH_TD,RUSH_Lng,RUSH_Y/A,RUSH_Y/G,RUSH_A/G,RCV_Tgt,RCV_Rec,RCV_Yds,RCV_Y/R,RCV_TD,RCV_Lng,RCV_R/G,RCV_Y/G,YScm,RRTD,Fmb,"+
				  "PUNT_Ret,PUNT_Yds,PUNT_TD,PUNT_Lng,PUNT_Y/R,KICK_Rt,KICK_Yds,KICK_TD,KICK_Lng,KICK_Y/Rt,APYd,"+
				  "DEF_Int,DEF_Yds,DEF_TD,DEF_Lng,DEF_PD,FUMB_FF,FUMB_Fmb,FUMB_FR,FUMB_Yds,FUMB_TD,Sk,Tkl,Ast,Sfty,AV";
	return tableHeader+"\r\n";

}


function collectStats(playerPage, playerName, year, rnd, pck) {
	var xhr2 = new XMLHttpRequest();
	xhr2.open('GET',playerPage,"false");
	xhr2.responseText = "document";
	xhr2.onreadystatechange = function() {
		if (xhr2.readyState == 4 && xhr2.status == 200) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr2.responseText, "text/html");
			var table;

			var allTables = doc.getElementsByTagName("table");
			var tableType = "";
			//console.log(allTables);

			for (table in allTables){
				if (allTables.hasOwnProperty(table)){
					tableType = allTables[table].id;
					if(tableType == "passing") {
						table = allTables[table];
						//console.log(1);
						break;
					}
					else if(tableType == 'rushing_and_receiving') {
						table = allTables[table];
						//console.log(2);
		 				break;
					}
					else if(tableType == 'receiving_and_rushing') {
						table = allTables[table];
						//console.log(3);
						break;
					}
					else if(tableType == 'defense') {
						table = allTables[table];
						//console.log(4);
						break;
					}
					else if(tableType == 'returns') {
						table = allTables[table];
						//console.log(5);
						break;
					}
				}
			}
			
			//console.log(table);
			//Get number of rows/columns
			console.log(playerName);
			var numRows = table.rows.length;

			var numCols = table.rows[0].cells.length;
			//Declare string to fill with table data
			//Get column headers
			var row = 2;
			if(table.id == 'passing') {
				row = 1;
			}
			//for (var i = 0; i < table.rows[row].cells.length; i++) {
			//    tableString += table.rows[row].cells[i].innerHTML.split(",").join("") + ",";
		    //}
			//console.log(tableString);

			//tableString = tableString.substring(0, tableString.length - 1);
			var tableRow = "";
			//Get row data
			exitLoop:
			for (var j = row; j < numRows; j++) {
				//tableString += playerName.replace(",", " ")+","+year+""+rnd+""+pck+""+",";
				tableRow = playerName.replace(","," ")+","+year+""+rnd+""+pck+","+
							"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"+
							"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"+
							"0,0,0,0,0,0,0,0,0,0,0,\r\n";

				var val, index;
			    for (var k = 0; k < table.rows[j].cells.length; k++) {
			    	//skip career rows and rows following the carrer row
			    	if(table.rows[j].cells[k].innerHTML == "Career") {
			    		//if the Career row is being read skip to the end
			    		break exitLoop;
			    	}
			    	//if there at anchors extract the anchor text
			    	else if(table.rows[j].cells[k].getElementsByTagName('a')[0]) {
			    		index = getIndex(tableType, k);
			    		val = table.rows[j].cells[k].getElementsByTagName('a')[0].innerHTML.split(",").join("");
			    		rowVals = tableRow.split(',');
			    		rowVals[index] = val;
			    		tableRow = rowVals.join();
			    	}
			    	else if(k===0 && table.rows[j].cells[0].innerHTML === ''){
			    		index = getIndex(tableType, k);
			    		var preValue = table.rows[j-1].cells[k].innerHTML;
			    		rowVals = tableRow.split(',');
			    		rowVals[index] = preValue;
			    		tableRow = rowVals.join();
			    		//table.rows[j].cells[k].innerHTML = preValue;
			    		//tableString += preValue.split(",").join("") + ",";
			    	}
			    	else if(table.rows[j].cells[k].textContent !== undefined) {
			    		index = getIndex(tableType, k);
			    		val = table.rows[j].cells[k].textContent.split(",").join("");
			    		//tableString += table.rows[j].cells[k].textContent.split(",").join("") + ",";
			    		rowVals = tableRow.split(',');
			    		rowVals[index] = val;
			    		tableRow = rowVals.join();
			    	}

			    	//simply add text to the csv string 
			    	else {
			    		index = getIndex(tableType, k);
			    		val = table.rows[j].cells[k].innerHTML.split(",").join("");
			    		//tableString += table.rows[j].cells[k].innerHTML.split(",").join("") + ",";
			    		rowVals = tableRow.split(',');
			    		rowVals[index] = val;
			    		tableRow = tableRow.join();
			    	}
			    }

			    tableString += tableRow+"\r\n";
			}
			//replace playername with UID
			//console.log(tableString);
		}
	};
	xhr2.send();
}

function getIndex(tableType, keyIdx) {
	var newKey;
	switch(tableType) {
		case "passing":
			keys = ["Year","Age","Tm","Pos","No.","G","GS","QBrec","Cmp","Att","Cmp%","Yds","TD","TD%","Int","Int%","Lng","Y/A","AY/A","Y/C","Y/G","Rate","QBR","Sk","Yds","NY/A","ANY/A","Sk%","4QC","GWD","AV"];
			break;
		case "rushing_and_receiving":
			keys = ["Year","Age","Tm","Pos","No.","G","GS","RUSH_Att","RUSH_Yds","RUSH_TD","RUSH_Lng","RUSH_Y/A","RUSH_Y/G","RUSH_A/G","RCV_Tgt","RCV_Rec","RCV_Yds","RCV_Y/R","RCV_TD","RCV_Lng","RCV_R/G","RCV_Y/G","YScm","RRTD","Fmb","AV"];
			break;
		case "receiving_and_rushing":
			keys = ["Year","Age","Tm","Pos","No.","G","GS","RCV_Tgt","RCV_Rec","RCV_Yds","RCV_Y/R","RCV_TD","RCV_Lng","RCV_R/G","RCV_Y/G","RUSH_Att","RUSH_Yds","RUSH_TD","RUSH_Lng","RUSH_Y/A","RUSH_Y/G","RUSH_A/G","YScm","RRTD","Fmb","AV"];
			break;
		case "defense":
			keys = ["Year","Age","Tm","Pos","No.","G","GS","DEF_Int","DEF_Yds","DEF_TD","DEF_Lng","DEF_PD","FUMB_FF","FUMB_Fmb","FUMB_FR","FUMB_Yds","FUMB_TD","Sk","Tkl","Ast","Sfty","AV"];
			break;
		case "returns":
			keys = ["Year","Age","Tm","Pos","No.","G","GS","PUNT_Ret","PUNT_Yds","PUNT_TD","PUNT_Lng","PUNT_Y/R","KICK_Rt","KICK_Yds","KICK_TD","KICK_Lng","KICK_Y/Rt","APYd","AV"];
			break;
		default:
			return;
	}
	newKey = keys[keyIdx];
	return getOffIndex(newKey);
}

function getOffIndex(key) {
	tableHeaders = ["Name","UID","Year","Age","Tm","Pos","No.","G","GS","QBrec","Cmp","Att","Cmp%","Yds","TD","TD%","Int","Int%","Lng","Y/A","AY/A","Y/C","Y/G","Rate","QBR","Sk","Yds","NY/A","ANY/A","Sk%","4QC","GWD",
					"RUSH_Att","RUSH_Yds","RUSH_TD","RUSH_Lng","RUSH_Y/A","RUSH_Y/G","RUSH_A/G","RCV_Tgt","RCV_Rec","RCV_Yds","RCV_Y/R","RCV_TD","RCV_Lng","RCV_R/G","RCV_Y/G","YScm","RRTD","Fmb",
					"PUNT_Ret","PUNT_Yds","PUNT_TD","PUNT_Lng","PUNT_Y/R","KICK_Rt","KICK_Yds","KICK_TD","KICK_Lng","KICK_Y/Rt","APYd",
					"DEF_Int","DEF_Yds","DEF_TD","DEF_Lng","DEF_PD","FUMB_FF","FUMB_Fmb","FUMB_FR","FUMB_Yds","FUMB_TD","Sk","Tkl","Ast","Sfty","AV"];
	idx = tableHeaders.indexOf(key);
	return idx;
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