var BrackChart_gl_FLAGS = {"Antrim":["ffbb33","ffffff"],"Galway":["892525","ffffff"],"Leitrim":["098c0b","f9f504"],"Mayo":["098c0b","ed0909"],"Roscommon":["310de2","f9f504"],"Sligo":["000000","ffffff"],"Carlow":["098c0b","ed0909","f9f504"],"Dublin":["8fcff7","19397a"],"Kildare":["ffffff"],"Kilkenny":["000000","e8e409"],"Laois":["310de2","ffffff"],"Longford":["310de2","ecf400"],"Louth":["f40000","ffffff"],"Meath":["098c0b","f9f504"],"Offaly":["098c0b","ffffff","e8e409"],"Westmeath":["892525","ffffff"],"Wexford":["#6500a0","f9f504"],"Wicklow":["310de2","f9f504"],"Munster Council":["310de2","000a9e"],"Clare":["ecf400","310de2"],"Cork":["f40000","ffffff"],"Kerry":["098c0b","f9f504"],"Limerick":["098c0b","ffffff"],"Tipperary":["310de2","ecf400"],"Waterford":["ffffff","310de2"],"Armagh":["fc9b0a","ffffff"],"Cavan":["310de2","ffffff"],"Derry":["f40000","ffffff"],"Donegal":["098c0b","f9f504"],"Down":["f40000","000000"],"Fermanagh":["098c0b","ffffff"],"Monaghan":["ffffff","310de2"],"Tyrone":["ffffff","f40000"]};

function BrackChart(selector, data)
{
	this.rounds = this.createRounds(data);
	this.element = document.querySelector(selector);
	this.element.classList.add("BrackChart_wrapper");
	this.element.innerHTML = "";

	if (BrackChart_gl_WRAPPERPADDING)
	{
		this.element.style.marginLeft = BrackChart_gl_XSPACING + "px";
		this.element.style.marginTop = 2 * BrackChart_gl_YSPACING + "px";
		this.element.style.marginBottom = BrackChart_gl_YSPACING + "px";
	}
	
	this.element.style.width = this.rounds.length * (BrackChart_gl_WIDTH + BrackChart_gl_XSPACING) + "px";
}

BrackChart.prototype.showTitles = function(titles)
{
	for (let [xIndex, title] of titles.entries())
	{
		var tit = document.createElement("div");
		tit.classList.add("BrackChart_title");
		tit.innerText = title;
		tit.style.top = -2 * BrackChart_gl_YSPACING + "px";
		tit.style.left = (BrackChart_gl_WIDTH + BrackChart_gl_XSPACING) * xIndex + "px";
		this.element.appendChild(tit);
	}
}

BrackChart.prototype.useConfig = function(config)
{
	this.config = config;
}

BrackChart.prototype.createRounds = function(data)
{
	var lastRound = null;
	var rounds = [];

	for (let roundData of data)
	{
		var round = new BrackChartRound();
		round.setParent(lastRound);
		round.createFromData(roundData);
		lastRound = round;
		rounds.push(round);
	}

	return rounds;
}

BrackChart.prototype.updateMatchDimensions = function()
{
	var lowest = 0;

	for (let [xIndex, round] of this.rounds.entries())
	{
		for (let [yIndex, match] of round.matches.entries())
		{
			match.x = xIndex * (BrackChart_gl_WIDTH + BrackChart_gl_XSPACING);

			if (match.hasParents())
			{
				match.y = (match.parent1.y + match.parent2.y) / 2;
			}
			else
			{
				match.y = yIndex == 0 ? 0 : round.matches[yIndex - 1].y + BrackChart_gl_HEIGHT + BrackChart_gl_YSPACING;
			}

			match.width = BrackChart_gl_WIDTH;
			match.height = BrackChart_gl_HEIGHT;

			if (match.y > lowest) lowest = match.y;
		}
	}

	this.element.style.height = lowest + BrackChart_gl_HEIGHT + "px";
}

BrackChart.prototype.createChart = function()
{
	if (this.config !== undefined) this.config.use();
	this.updateMatchDimensions();
	this.rounds.forEach(round => this.generateRound(round));
}

BrackChart.prototype.generateRound = function(round)
{
	var matches = round.matches;
	matches.forEach(match => {this.drawMatchBox(match); this.drawMatchBoxLines(match);});
}

BrackChart.prototype.drawMatchBox = function(match)
{
	var matchBox = document.createElement("div");
	matchBox.classList.add("BrackChart_match");

	matchBox.style.width = match.width + "px";
	matchBox.style.height = match.height + "px";
	matchBox.style.left = match.x + "px";
	matchBox.style.top = match.y + "px";

	if (match.data.prev !== undefined && match.data.prev != false)
	{
		matchBox.classList.add("prev");

		var message = document.createElement("div");
		message.style.left = match.x + "px";
		message.style.top = match.y + BrackChart_gl_HEIGHT + 5 + "px";
		message.classList.add("BrackChart_bubble");
		message.innerText = match.data.prev;
		matchBox.onmouseenter = () => message.classList.add("visible");
		matchBox.onmouseleave = () => message.classList.remove("visible");
		this.element.appendChild(message);
		//matchBox.onclick = () => alert(match.data.prev)
	}

	var scores = this.drawMatchBoxScores(match);
	matchBox.appendChild(scores);

	if (match.data["more-info"] !== undefined && match.data["more-info"].length > 0)
	{
		var info = this.drawMatchBoxInfo(match);
		matchBox.appendChild(info);

		info.style.transform = "translateX(100%) translateY(-" + match.height + "px)";
		
		scores.querySelector(".BrackChart_button").onclick = function()
		{
			scores.classList.add("hidden");
			info.style.transform = "translateX(0%) translateY(-" + match.height + "px)";
		}

		info.querySelector(".BrackChart_back").onclick = function()
		{
			scores.classList.remove("hidden");
			info.style.transform = "translateX(100%) translateY(-" + match.height + "px)";
		}
	}
	
	this.element.appendChild(matchBox);
}

BrackChart.prototype.drawMatchBoxScores = function(match)
{
	var scores = document.createElement("div");
	scores.classList.add("BrackChart_scores");

	scores.appendChild(this.createMatchBoxTeam(match.team1, match.score1, match.isTeam1Winner));
	scores.appendChild(this.createMatchBoxInfo(match));
	scores.appendChild(this.createMatchBoxTeam(match.team2, match.score2, match.isTeam2Winner));

	if (match.winner)
	{
		var circle = document.createElement("div");
		circle.classList.add("BrackChart_winnerLine");

		if (match.winner == 1)
		{
			circle.style.top = "33px";
			circle.style.left = "173px";
		}
		else
		{
			circle.style.bottom = "10px";
			circle.style.left = "173px";
		}

		scores.appendChild(circle);
	}

	return scores;
}

BrackChart.prototype.drawMatchBoxInfo = function(match)
{
	var info = document.createElement("div");
	info.classList.add("BrackChart_info");

	if (match.data["more-info"] !== undefined)
	{
		for (var inf of match.data["more-info"])
		{
			info.appendChild(this.createMoreInfoText(inf));
		}
	}

	var back = document.createElement("back");
	back.classList.add("BrackChart_back");
	back.innerHTML = 'BACK';
	back.style.top = BrackChart_gl_HEIGHT - 35 + "px";
	back.style.width = BrackChart_gl_WIDTH + "px";
	back.onmousedown = () => back.classList.add("active");
	back.addEventListener("transitionend", () => back.classList.remove("active"));
	back.addEventListener("webkitTransitionEnd", () => back.classList.remove("active"));
	info.appendChild(back);

	return info;
}

BrackChart.prototype.createMoreInfoText = function(text)
{
	var element = document.createElement("div");
	element.classList.add("BrackChart_moreInfoText");
	element.innerText = text;

	return element;
}

BrackChart.prototype.createMatchBoxTeam = function(name, score, isWinner)
{
	var team = document.createElement("div");
	team.classList.add("BrackChart_team");

	if (isWinner == true)
	{
		team.classList.add("BrackChart_winner");
	}

	if (isWinner == false)
	{
		team.classList.add("BrackChart_loser");
	}

	/*var flag = new Image();
	flag.src = "ie-kerry.gif";
	flag.classList.add("BrackChart_flag");*/

	var colors = BrackChart_gl_FLAGS[name];

	if (colors)
	{
		for (var color of colors)
		{
			var flag = document.createElement("div");
			flag.classList.add("BrackChart_flag");
			flag.style.backgroundColor = "#" + color;
			flag.style.width = 48 / colors.length + "px";
			team.appendChild(flag);
		}

		var last = colors[colors.length - 1];

		if (last == "ffffff")
		{
			var flag1 = document.createElement("div");
			flag1.classList.add("BrackChart_flag");
			flag1.style.backgroundColor = "#" + last;
			flag1.style.width = "1px";
			team.appendChild(flag1);

			var flag2 = document.createElement("div");
			flag2.classList.add("BrackChart_flag");
			flag2.style.backgroundColor = "#ccc"
			flag2.style.width = "1px";
			team.appendChild(flag2);
		}
		else
		{
			var flag3 = document.createElement("div");
			flag3.classList.add("BrackChart_flag");
			flag3.style.backgroundColor = "#" + last;
			flag3.style.width = "2px";
			team.appendChild(flag3);
		}

	}
	else
	{
		var flag4 = document.createElement("div");
		flag4.classList.add("BrackChart_flag");
		flag4.style.backgroundColor = "#444";
		flag4.style.width = "50px";
		team.appendChild(flag4);
	}

	var teamName = document.createElement("div");
	teamName.classList.add("BrackChart_teamName");
	teamName.innerHTML = name;

	var teamScore = document.createElement("div");
	teamScore.classList.add("BrackChart_teamScore");
	teamScore.innerHTML = score;

	team.appendChild(teamName);
	team.appendChild(teamScore);

	return team;
}

BrackChart.prototype.createMatchBoxInfo = function(match)
{
	var element = document.createElement("div");
	element.classList.add("BrackChart_info");

	var time = document.createElement("div");
	time.classList.add("BrackChart_time");
	time.innerHTML = match.data.time;

	var date = document.createElement("div");
	date.classList.add("BrackChart_date");
	date.innerHTML = match.data.date;

	element.appendChild(time);
	element.appendChild(date);

	var button = document.createElement("div");
	button.classList.add("BrackChart_button");
	button.innerHTML = "MORE INFO";
	element.appendChild(button);

	if (match.data["more-info"] !== undefined && match.data["more-info"].length > 0)
	{
		button.onmousedown = () => button.classList.add("active");

		button.addEventListener("webkitTransitionEnd", () => button.classList.remove("active"));
		button.addEventListener("transitionend", () => button.classList.remove("active"));
	}
	else
	{
		button.classList.add("hidden");
		button.style.cursor = "default";
	}

	return element;
}

BrackChart.prototype.drawMatchBoxLines = function(match)
{
	if (match.hasParents())
	{
		var p1offset = match.parent1.winner == 1 ? - BrackChart_gl_HEIGHT / 3 : match.parent1.winner == 2 ? + BrackChart_gl_HEIGHT / 3 : 0;
		var p2offset = match.parent2.winner == 1 ? - BrackChart_gl_HEIGHT / 3 : match.parent2.winner == 2 ? + BrackChart_gl_HEIGHT / 3 : 0;

		if (match.parent1.data.loserWins) p1offset *=-1;
		if (match.parent2.data.loserWins) p2offset *=-1;

		this.drawLineY(match.x - BrackChart_gl_XSPACING / 2, match.parent1.y + BrackChart_gl_HEIGHT / 2 + p1offset, match.parent2.y + BrackChart_gl_HEIGHT / 2 + p2offset);
		
		this.drawLineX(match.parent1.x + BrackChart_gl_WIDTH, match.x - BrackChart_gl_XSPACING / 2, match.parent1.y + p1offset + BrackChart_gl_HEIGHT / 2);
		this.drawLineX(match.parent2.x + BrackChart_gl_WIDTH, match.x - BrackChart_gl_XSPACING / 2, match.parent2.y + p2offset + BrackChart_gl_HEIGHT / 2);
		
		this.drawLineX(match.x - BrackChart_gl_XSPACING / 2, match.x, match.y + BrackChart_gl_HEIGHT / 2);
	}
}

BrackChart.prototype.drawLineY = function(x, y1, y2)
{
	var height = y2 - y1;
	var line = document.createElement("div");
	line.classList.add("BrackChart_line");
	line.style.top = y1 + "px";
	line.style.left = x - (BrackChart_gl_LINEW / 2) + "px";
	line.style.width = BrackChart_gl_LINEW + "px";
	line.style.height = height + "px";
	this.element.appendChild(line);
}

BrackChart.prototype.drawLineX = function(x1, x2, y)
{
	var width = x2 - x1;
	var line = document.createElement("div");
	line.classList.add("BrackChart_line");
	line.style.top = y - (BrackChart_gl_LINEW / 2) + "px";
	line.style.left = x1 + "px";
	line.style.width = width + "px";
	line.style.height = BrackChart_gl_LINEW + "px";
	this.element.appendChild(line);
}

var BrackChart_gl_WIDTH = 230;
var BrackChart_gl_HEIGHT = 130;
var BrackChart_gl_XSPACING = 60;
var BrackChart_gl_YSPACING = 30;
var BrackChart_gl_LINEW = 1;
var BrackChart_gl_WRAPPERPADDING = true;

function BrackChartConfig()
{
	this.width = 200;
	this.height = 130;
	this.paddingX = 60;
	this.paddingY = 30;
	this.lineWidth = 2;
	this.chartHasMargin = true;
}

BrackChartConfig.prototype.setMatchWidth = function(width)
{
	this.width = width;
}

BrackChartConfig.prototype.setMatchHeight = function(height)
{
	this.height = height;
}

BrackChartConfig.prototype.setPaddingX = function(padding)
{
	this.paddingX = padding;
}

BrackChartConfig.prototype.setPaddingY = function(padding)
{
	this.paddingY = padding;
}

BrackChartConfig.prototype.setLineWidth = function(width)
{
	this.lineWidth = width;
}

BrackChartConfig.prototype.setChartHasMargin = function(bool)
{
	this.chartHasMargin = bool == true ? true : bool === undefined ? true : false;
	console.log(this.chartHasMargin)
}

BrackChartConfig.prototype.use = function()
{
	BrackChart_gl_WIDTH = this.width;
	BrackChart_gl_HEIGHT = this.height;
	BrackChart_gl_XSPACING = this.paddingX;
	BrackChart_gl_YSPACING = this.paddingY;
	BrackChart_gl_LINEW = this.lineWidth;
	BrackChart_gl_WRAPPERPADDING = this.chartHasMargin;
}

function BrackChartMatch()
{
	this.parent1 = null;
	this.parent2 = null;
	this.data = {};
}

BrackChartMatch.prototype.setTeams = function(team1, team2)
{
	this.team1 = team1;
	this.team2 = team2;
}

BrackChartMatch.prototype.setScores = function(score1, score2)
{
	this.score1 = score1;
	this.score2 = score2;
}

BrackChartMatch.prototype.setWinner = function(winner)
{
	this.winner = winner;

	if (winner == null)
	{
		this.winnerName = null;
		this.isTeam1Winner = null;
		this.isTeam2Winner = null;
	}
	else
	{
		this.winnerName = this["team" + winner];
		this.isTeam1Winner = winner == 1;
		this.isTeam2Winner = winner == 2;
	}
}

BrackChartMatch.prototype.setParents = function(parent1, parent2)
{
	this.parent1 = parent1;
	this.parent2 = parent2;
}

BrackChartMatch.prototype.hasParents = function()
{
	return this.parent1 || this.parent2;
}

function BrackChartRound()
{
	this.parent = null;
	this.matches = [];
}

BrackChartRound.prototype.setParent = function(parent)
{
	this.parent = parent;
}

BrackChartRound.prototype.createFromData = function(roundData)
{
	var childIndex = 0;

	for (let [i, matchData] of roundData.entries())
	{
		var match = new BrackChartMatch();
		match.setTeams(matchData.team1, matchData.team2);
		match.setScores(matchData.score1, matchData.score2);
		match.setWinner(matchData.winner);

		if (matchData.connectsFrom && this.parent != null)
		{
			var parent1 = this.parent.getMatch(childIndex * 2);
			var parent2 = this.parent.getMatch(childIndex * 2 + 1);
			match.setParents(parent1, parent2);
		}

		match.data = matchData;

		this.matches.push(match);

		if (!matchData.prev)
			childIndex++;
	}
}

BrackChartRound.prototype.getMatch = function(index)
{
	return this.matches[index];
}