$( document ).ready(function() {
    console.log( "ready!" );

	clearAllSvgNames();
	
	var gameData = {
		"opponent" : "",
		"dateTimeField" : "",
		"roster" : []
		
	};
	
	if (localStorage.getItem('gameData')) {
		gameData = JSON.parse(localStorage.getItem('gameData'));
	}
	else {
		gameData = {
			"opponent" : "Athletico",
			"dateTimeField" : "9/5 3pm North Creek #1",
			"roster" : [
				{"number":31, "name":"Sam B"},
				{"number":8,  "name":"Camden"},
				{"number":12, "name":"Liam"},
				{"number":4,  "name":"Sam F"},
				{"number":5,  "name":"Cooper"},
				{"number":16, "name":"Langston", pos:[]},
				{"number":29, "name":"James H"},
				{"number":7,  "name":"Ryan"},
				{"number":15, "name":"Charlie"},
				{"number":10, "name":"Ian"},
				{"number":3,  "name":"James O"},
				{"number":37, "name":"Anthony"},
				{"number":19, "name":"Ethan"},
				{"number":9,  "name":"Sean", pos:[]},
				{"number":6,  "name":"Ben"},
				{"number":18, "name":"Owen"}
			]
		}
	}
	
	loadOpponent();
	loadFieldAndLocation();
	buildRoster();
	registerKeyPress();
	$('#save').click(function() {
		save();
	});
	$('#clear').click(function() {
		clearPositions();
	});
	
	function loadOpponent() {
		$('#opponent').html(gameData.opponent);
	}
	
	function loadFieldAndLocation() {
		$('#dateTimeField').html(gameData.dateTimeField);
	}
	
	function buildRoster() {
		gameData.roster.sort(SortByNumber);
		$.each(gameData.roster, function(index, p) {
			$('#remaining').before('<tr id="pid-' + p.number + '"><td class="numberName"><div class="number">#' + p.number + '</div><div class="player">' + p.name + '</div></td><td class="qtr q1" contenteditable></td><td class="qtr q2" contenteditable></td><td class="qtr q3" contenteditable></td><td class="qtr q4" contenteditable></td></tr>');
			$.each(p.pos, function(index, pos) {
				var qtr = $('#pid-' + p.number).find('.q' + (index+1));
				if (pos != 0) {
					qtr.html(pos);
				}
				updateRemainingInQtr(qtr);
				updateSvgNames();
			});
		});
		$("td.qtr").focus(function(){
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
		updateCellColorQtrNum(1);
		updateCellColorQtrNum(2);
		updateCellColorQtrNum(3);
		updateCellColorQtrNum(4);
	}

	function registerKeyPress() {
		$('#roster td.qtr').each(function(index) {
			$(this).keyup(function() {
				updateModel($(this));
				updateCellColor($(this));
				updateRemainingInQtr($(this));
				updateSvgNames();
			});
		});
	}
	
	function updateModel(qtr) {
		var playerTr = qtr.parent();
		var playerNum = playerTr.attr("id").split("-")[1];
		var player = getPlayer(playerNum);
		if (player != undefined) {
			player.pos = [];
			playerTr.find('.qtr').each(function(index) {
				player.pos.push(Number($(this).html()));
			});
		}
	}
	
	function save() {
		gameData.opponent = $('#opponent').html();
		gameData.dateTimeField = $('#dateTimeField').html();
		var gameDataJsonString = JSON.stringify(gameData);
		localStorage.setItem('gameData', gameDataJsonString);
	}

	function clearPositions() {
		$('#roster td.qtr').each(function(index) {
			var qtr = $(this);
			qtr.html("");
			updateModel(qtr);
			updateCellColor(qtr);
			updateRemainingInQtr(qtr);
			clearAllSvgNames();
		});
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
	
	function updateCellColor(qtr) {
		var qtrNum;
		if (qtr.is('.q1')) {
			qtrNum = 1;
		} else if (qtr.is('.q2')) {
			qtrNum = 2;
		} else if (qtr.is('.q3')) {
			qtrNum = 3;
		} else if (qtr.is('.q4')) {
			qtrNum = 4;
		}
		updateCellColorQtrNum(qtrNum);
	}
	
	function updateCellColorQtrNum(qtrNum) {
		var seen = {};
		$('#roster td.q' + qtrNum).each(function(index) {
			var cur = $(this).html();
			if (seen[cur] == undefined) {
				seen[cur] = 1;
			}
			else {
				seen[cur] = seen[cur] + 1;
			}
		});
		
		$('#roster td.q' + qtrNum).each(function(index) {
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
	
	function updateRemainingInQtr(qtr) {
		var qtrNum;
		if (qtr.is('.q1')) {
			qtrNum = 1;
		} else if (qtr.is('.q2')) {
			qtrNum = 2;
		} else if (qtr.is('.q3')) {
			qtrNum = 3;
		} else if (qtr.is('.q4')) {
			qtrNum = 4;
		}
		
		var pos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		
		$('#roster td.q' + qtrNum).each(function(index) {
			var ele = $(this);
			var q = ele.html();
			pos = $.grep(pos, function(value) {
				return value != q;
			});
		});
		
		$('#remaining td.q' + qtrNum + 'Remaining').html(pos.join(' '));
	}

	function SortByName(a, b){
	  var aName = a.name.toLowerCase();
	  var bName = b.name.toLowerCase(); 
	  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}
	function SortByNumber(a, b){
	  return ((a.number < b.number) ? -1 : ((a.number > b.number) ? 1 : 0));
	}

	function updateSvgNames() {
		clearAllSvgNames();
		
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
	function clearAllSvgNames() {
		for (var i=1; i<12; i++) {
			for (var j=1; j<5; j++) {
				var slot = document.getElementById("q" + j + "-p" + i);
				if (slot != undefined) {
					slot.textContent = '';
				}
			}
		}
	}
	
});

