$( document ).ready(function() {
    console.log( "ready!" );

	//Global
	var SHIFT_COUNT = 4;
	var gameData = { "opponent" : "", "dateTimeField" : "", "roster" : [] };
	var svgNS = "http://www.w3.org/2000/svg";
	initPage();
	
	function initPage() {
		clearAllSvgNames();
		loadGameData();
		loadOpponent();
		loadFieldAndLocation();
		renderRoster();
		updateRemainingInShift();
		updateSvgNames();
		updateAllCellColor();
	}
	
	function loadOpponent() {
		$('#opponent').html(gameData.opponent);
	}
	
	function loadFieldAndLocation() {
		$('#dateTimeField').html(gameData.dateTimeField);
	}
	
	function loadGameData() {
		if (localStorage.getItem('gameData')) {
			console.log('gameData json loading from local storage');
			gameData = JSON.parse(localStorage.getItem('gameData'));
		}
		else {
			console.log('gameData json loading from javascript default');
			gameData = {
				"opponent" : "Athletico",
				"dateTimeField" : "9/5 3pm North Creek #1",
				"roster" : [
					{"number":12, "name":"Liam", pos:[]},
					{"number":5,  "name":"Cooper", pos:[]},
					{"number":16, "name":"Langston", pos:[]},
					{"number":3,  "name":"James", pos:[]},
					{"number":19, "name":"Ethan", pos:[]},
					{"number":9,  "name":"Sean", pos:[]},
					{"number":10,  "name":"Jeiven", pos:[]},
					{"number":34,  "name":"Duzi", pos:[]},
					{"number":1,   "name":"Michael", pos:[]},
					{"number":42,  "name":"Gabe", pos:[]},
					{"number":14,  "name":"Caleb", pos:[]},
					{"number":29,  "name":"Tabito", pos:[]},
					{"number":11,  "name":"Lucas", pos:[]},
					{"number":41,  "name":"Austin", pos:[]},
					{"number":28,  "name":"Reece", pos:[]},
					{"number":37,  "name":"Anthony", pos:[]},
					{"number":18,  "name":"Owen", pos:[]}
				]
			}
		}
		return gameData;
	}
	
	function renderRoster() {
		gameData.roster.sort(SortByName);
		$('#roster').empty();
		$.each(gameData.roster, function(index, p) {
			// Draw roster rows
			var newRow = $('<tr id="pid-' + p.number + '" class="player-row"><td class="numberName"><div class="number">#' + p.number + '</div><div class="player">' + p.name + '</div></td></tr>');
			newRow.appendTo($('#roster'));
			//$('#remaining').before(newRow);
			for (var j=0; j<SHIFT_COUNT; j++) {
				var newTd = $('<td class="shift s' + j + '" style="width:' + 100/SHIFT_COUNT + '%" contenteditable></td>').appendTo(newRow);
				// fill in positions
				if (!(typeof p.pos[j] === 'undefined')) {
					if (p.pos[j] == -1) {
						newTd.html('');
					} else if (p.pos[j] == 0) {
						newTd.html('-');
					} else {
						newTd.html(p.pos[j]);	
					}
				}
			}
		});
		
		// add remaining row
		var remainingRow = $('<tr id="remaining"><th></th></tr>');
		remainingRow.appendTo($('#roster'));		
		for (var j=0; j<SHIFT_COUNT; j++) {
			var newTd = $('<td class="s' + j + 'Remaining"></td>').appendTo(remainingRow);
		}		
		
		// add goals us row
		var goalsUs = $('<tr id="goals-us"><td>Goals Us</td></tr>');
		goalsUs.appendTo($('#roster'));		
		for (var j=0; j<SHIFT_COUNT; j++) {
			var newTd = $('<td></td>').appendTo(goalsUs);
		}	
		// add goals them row	
		var goalsThem = $('<tr id="goals-them"><td>Goals Them</td></tr>');
		goalsThem.appendTo($('#roster'));		
		for (var j=0; j<SHIFT_COUNT; j++) {
			var newTd = $('<td></td>').appendTo(goalsThem);
		}
		registerSelectionOnFocus();
		registerKeyPressAndClick();
	}

	function registerSelectionOnFocus() {
		// when cursor lands in shift td, select all
		$("td.shift").focus(function(){
			var div = this;
			window.setTimeout(function() {
				var sel, range;
				if (window.getSelection && document.createRange) {
					range = document.createRange();
					range.selectNodeContents(div);
					sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				} else if (document.body.createTextRange) {
					range = document.body.createTextRange();
					range.moveToElementText(div);
					range.select();
				}
			}, 1);			
		});
	}

	function registerKeyPressAndClick() {
		$('#roster td.shift').each(function(index) {
			$(this).keyup(function() {
				updateModelFromDom($(this));
				updateAllCellColor();
				updateRemainingInShift();
				updateSvgNames();
			});
		});
		
		$('#save').click(function() {
			save();
		});
		$('#clear').click(function() {
			localStorage.removeItem('gameData');
			initPage();
		});
	}
	
	function updateModelFromDom(playerShift) {
		var playerTr = playerShift.parent();
		var playerNum = playerTr.attr("id").split("-")[1];
		var player = getPlayer(playerNum);
		if (player != undefined) {
			player.pos = [];
			playerTr.find('.shift').each(function(index) {
				var domNum = $(this).html();
				if (domNum == '-') {
					domNum = 0;
				} else if (domNum == '') {
					domNum = -1;
				}
				var num = Number(domNum);
				player.pos.push(num);
			});
		}
	}
	
	function save() {
		gameData.opponent = $('#opponent').html();
		gameData.dateTimeField = $('#dateTimeField').html();
		var gameDataJsonString = JSON.stringify(gameData);
		localStorage.setItem('gameData', gameDataJsonString);
	}
	
	function getPlayer(playerNum) {
		var player;
		$.each(gameData.roster, function(index, p) {
			if (p.number == playerNum) {
				player = p;
				return false;
			}
		});
		return player;
	}
	
	function updateAllCellColor() {
		for (var j=0; j<SHIFT_COUNT; j++) {
			var seen = {};
			$('#roster td.s' + j).each(function(index) {
				var cur = $(this).html();
				if (seen[cur] == undefined) {
					seen[cur] = 1;
				}
				else {
					seen[cur] = seen[cur] + 1;
				}
			});
			
			$('#roster td.s' + j).each(function(index) {
				$(this).removeClass("warning sit");
				var cur = $(this).html();
				if (cur > 0 && cur < 12) {
					if (seen[cur] > 1) {
						$(this).addClass("warning");
					}
					else {
						$(this).removeClass("warning");
					}
				}
				else {
					if (cur == '-') {
						$(this).addClass("sit");
					}
					else {
						$(this).addClass("warning");
					}
				}
			});
		}
	}
	
	
	function updateRemainingInShift() {
		for (var j=0; j<SHIFT_COUNT; j++) {
			var pos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
			$('#roster td.s' + j).each(function(index) {
				var assignedPos = $(this).html();
				pos = $.grep(pos, function(value) {
					return value != assignedPos;
				});
				var remain = $('#remaining td.s' + j + 'Remaining');
				remain.html("");
				$.each(pos, function (i, p) {
					remain.append("<div>" + p + "</div>");
				});					
			});
		}
	}

	function SortByName(a, b){
	  var aName = a.name.toLowerCase();
	  var bName = b.name.toLowerCase(); 
	  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}
	function SortByNumber(a, b){
	  return ((a.number < b.number) ? -1 : ((a.number > b.number) ? 1 : 0));
	}

	// First removes then adds player names to SVG
	function updateSvgNames() {
		var BOX_WIDTH = 16;
		var BOX_HEIGHT = 5;
		clearAllSvgNames();
		
		$.each(gameData.roster, function(indexPlr, player) {
			$.each(player.pos, function(indexPos, playerPos) {
				//alert(player.name + " pos=" + playerPos);
				var positionNum = document.getElementById("position-num" + playerPos);
				if (positionNum) {
					var cx = Number(positionNum.getAttributeNS(null,"cx"));
					var cy = Number(positionNum.getAttributeNS(null,"cy"));
					var x = cx;
					var y = cy;
					if ((indexPos+1) <= SHIFT_COUNT / 2) {
						x = x - BOX_WIDTH;
						y = y + 12 + (indexPos*BOX_HEIGHT);
					}
					else {
						x = x;
						y = y + 12 + ((indexPos- (SHIFT_COUNT / 2))*BOX_HEIGHT);
					}

					var newGroup = document.createElementNS(svgNS,"g");
					newGroup.setAttributeNS(null,"class","player-name");
					document.getElementById("field-svg").appendChild(newGroup);
					
					var newRect = document.createElementNS(svgNS,"rect");
					newRect.setAttributeNS(null,"x", x);		
					newRect.setAttributeNS(null,"y", y-6);				
					newRect.setAttributeNS(null,"width", BOX_WIDTH);		
					newRect.setAttributeNS(null,"height", BOX_HEIGHT);				
					newRect.setAttributeNS(null,"style", "fill:rgb(255,255,255);stroke-width:0.1;stroke:rgb(0,0,0)");				
					newGroup.appendChild(newRect);
					
					var newText = document.createElementNS(svgNS,"text");
					newText.setAttributeNS(null,"x", x+1);		
					newText.setAttributeNS(null,"y", y - 2);				
					newText.setAttributeNS(null,"font-size","3.5px");
					newGroup.appendChild(newText);
					var textNode = document.createTextNode(player.name);
					newText.appendChild(textNode);				
					
					var newLine = document.createElementNS(svgNS,"line");
					newLine.setAttributeNS(null,"x1", cx);		
					newLine.setAttributeNS(null,"y1", cy+5);				
					newLine.setAttributeNS(null,"x2", cx);		
					newLine.setAttributeNS(null,"y2", cy+6 + SHIFT_COUNT*BOX_HEIGHT/2);	
					newLine.setAttributeNS(null,"style", "stroke-width:0.5;stroke:rgb(0,0,0)");									
					newGroup.appendChild(newLine);

				}
			});
		});
		
		
		var $roster = $('#roster');
		$roster.find('tr').each(function(index) {
			var $tr = $(this);
			if ($tr.is('.remaining')) {
				return true;
			}
			
			var $tdList = $tr.find('td.qtr');
			$tdList.each(function(index) {
				var td = $(this);
				var pos = td.html();
				var quarter = index + 1;
				var player = td.parent().find('.player:first').html();
				var id = "q" + quarter + "-p" + pos;
				var slot = $('#' + id);
				if (slot.length > 0) {
					if (!td.is('.warning')) {
						slot.html(player);
					}
					else {
						slot.html('');
					}
				}
			});
		});
	}

	// Remove all names from SVG
	// Search svg and remove all player names regardless of slot and number.
	function clearAllSvgNames() {
		$('#field-svg .player-name').remove();
	}
	
});

