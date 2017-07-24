var brackChart_flags = [];

function BrackChart(data)
{
	this.c = {				// config
		"paddingX": 60,
		"paddingY": 30,
		"lineWidth": 1
	}

	this.lc = {				// local config (deprecated, will be moved to c in version 3)
		"matchWidth": 230,
		"matchHeight": 130,
		"lowestMatchY": 0
	}

	this.rounds = this.createRounds(data);
	this.roundNames = [];
}

BrackChart.prototype.config = function(config)
{
	this.c = config;
}

BrackChart.prototype.createRounds = function(data)
{
	var prevRound = null;
	var rounds = [];

	for (let [index, roundData] of data.entries())
	{
		var round = new BrackChartRound();
		round.c=this.c;round.lc=this.lc;
		round.setParent(prevRound);
		round.setIndex(index);
		round.createFromData(roundData);
		rounds.push(round);
		prevRound = round;
	}

	return rounds;
}

BrackChart.prototype.setRoundNames = function(roundNames)
{
	for (let [i, round] of roundNames.entries())
	{
		var roundName = new BrackChartRoundName(round, i)
		roundName.c=this.c;roundName.lc=this.lc;
		this.roundNames.push(roundName);
	}
}

BrackChart.prototype.createChart = function(selector)
{
	var element = document.querySelector(selector);
	var elementFactory = new BrackChartElementFactory(element);
	elementFactory.c=this.c;elementFactory.lc=this.lc;
	element.classList.add("BrackChart_wrapper");
	element.style.width = 2 * this.c.paddingX + this.rounds.length * (this.lc.matchWidth + this.c.paddingX) + "px";

	for (let round of this.rounds)
	{
		for (let match of round.matches)
		{
			elementFactory.createMatch(match);
			elementFactory.createLines(match.lines);
		}	
	}
}

function BrackChartElementFactory(element)
{
	this.element = element;
	element.innerHTML = "";

	while (element.firstChild)
	{
    	element.removeChild(element.firstChild);
	}
}

BrackChartElementFactory.prototype.createMatch = function(match)
{
	var node = document.createElement("div");
	node.classList.add("BrackChart_match");
	node.style.width = match.width + "px";
	node.style.height = match.height + "px";
	node.style.top = match.y + "px";
	node.style.left = match.x + "px";

	var team1 = this.createMatchTeam(match.team1, match.score1, match.winner == 1);
	var team2 = this.createMatchTeam(match.team2, match.score2, match.winner == 2);
	var info = this.createMatchInfo(match.info);

	var scores = document.createElement("div");
	scores.classList.add("BrackChart_scores");
	scores.appendChild(team1);
	scores.appendChild(info.element);
	scores.appendChild(team2);

	node.appendChild(scores);

	if (match.info.moreInfo && match.info.moreInfo.length > 0)
	{
		var backButton = document.createElement("div");
		backButton.classList.add("BrackChart_back");
		backButton.innerText = "BACK";
		backButton.style.top = this.lc.matchHeight - 35 + "px";
		backButton.style.width = this.lc.matchWidth + "px";

		backButton.onmousedown = () => backButton.classList.add("active");
		backButton.addEventListener("transitionend", () => backButton.classList.remove("active"));
		backButton.addEventListener("webkitTransitionEnd", () => backButton.classList.remove("active"));

		var moreInfo = document.createElement("div");
		moreInfo.classList.add("BrackChart_moreInfo");
		
		for (var text of match.info.moreInfo)
		{
			moreInfo.appendChild(this.createMatchMoreInfoText(text));
		}

		moreInfo.appendChild(backButton);
		node.appendChild(moreInfo);

		moreInfo.style.transform = "translateX(100%) translateY(-" + match.height + "px)";
		
		info.button.onclick = function()
		{
			scores.classList.add("hidden");
			moreInfo.style.transform = "translateX(0%) translateY(-" + match.height + "px)";
		}

		backButton.onclick = function()
		{
			scores.classList.remove("hidden");
			moreInfo.style.transform = "translateX(100%) translateY(-" + match.height + "px)";
		}
	}

	this.element.appendChild(node);
}

BrackChartElementFactory.prototype.createMatchInfo = function(info)
{
	var button = null;

	var element = document.createElement("div");
	element.classList.add("BrackChart_info");

	var time = document.createElement("div");
	time.classList.add("BrackChart_time");
	time.innerHTML = info.time;

	var date = document.createElement("div");
	date.classList.add("BrackChart_date");
	date.innerHTML = info.date;

	element.appendChild(time);
	element.appendChild(date);

	if (info.moreInfo !== undefined && info.moreInfo.length > 0)
	{
		button = document.createElement("div");
		button.classList.add("BrackChart_button");
		button.innerHTML = "MORE INFO";
		button.addEventListener("webkitTransitionEnd", () => button.classList.remove("active"));
		button.addEventListener("transitionend", () => button.classList.remove("active"));
		element.appendChild(button);
		button.onmousedown = () => button.classList.add("active");
	}

	return {"element": element, "button": button};
}

BrackChartElementFactory.prototype.createMatchMoreInfoText = function(text)
{
	var element = document.createElement("div");
	element.classList.add("BrackChart_moreInfoText");
	element.innerText = text;

	return element;
}

BrackChartElementFactory.prototype.createMatchTeam = function(name, score, isWinner)
{
	var team = document.createElement("div");
	team.classList.add("BrackChart_team");

	var flag = brackChart_flags[name];

	if (flag)
	{
		if (Array.isArray(flag))
		{
			for (var color of flag)
			{
				let node = document.createElement("div");
				node.classList.add("BrackChart_flag");
				node.style.backgroundColor = "#" + color;
				node.style.width = 48 / flag.length + "px";
				team.appendChild(node);
			}

			var last = flag[flag.length - 1];

			if (last == "ffffff")
			{
				let node2 = document.createElement("div");
				node2.classList.add("BrackChart_flag");
				node2.style.backgroundColor = "#" + last;
				node2.style.width = "1px";
				team.appendChild(node2);

				let node3 = document.createElement("div");
				node3.classList.add("BrackChart_flag");
				node3.style.backgroundColor = "#ccc"
				node3.style.width = "1px";
				team.appendChild(node3);
			}
			else
			{
				let node2 = document.createElement("div");
				node2.classList.add("BrackChart_flag");
				node2.style.backgroundColor = "#" + last;
				node2.style.width = "2px";
				team.appendChild(node2);
			}
		}
		else
		{
			var flag_img = document.createElement("img");
			flag_img.src = flag;
			flag_img.style.width = "50px";
			flag_img.style.height = "45px";
			team.appendChild(flag_img);
		}

	}
	else
	{
		let flag = document.createElement("div");
		flag.classList.add("BrackChart_flag");
		flag.style.backgroundColor = "#444";
		flag.style.width = "50px";
		team.appendChild(flag);
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

BrackChartElementFactory.prototype.createLines = function(lines)
{
	for (var line of lines)
	{
		this.createLine(line);
	}
}

BrackChartElementFactory.prototype.createLine = function(line)
{
	var node = document.createElement("div");
	node.classList.add("BrackChart_line");

	if (line.x1)	// line is going in the x direction
	{
		var width = line.x2 - line.x1;
		node.style.width = width + "px";
		node.style.height = this.c.lineWidth + "px";
		node.style.left = line.x1 + "px";
		node.style.top = line.y - this.c.lineWidth / 2 + "px";
	}
	else			// line is going in the y direction
	{
		var height = line.y2 - line.y1;
		node.style.width = this.c.lineWidth + "px";
		node.style.height = height + "px";
		node.style.left = line.x - this.c.lineWidth / 2 + "px";
		node.style.top = line.y1 + "px";
	}

	this.element.appendChild(node);
}

function BrackChartMatch(round)
{
	this.parent1 = null;
	this.parent2 = null;
	this.round = round;
	this.info = {};
	this.lines = [];
}

BrackChartMatch.prototype.initParents = function(prevRound, connectsFrom, childIndex)
{
	if (connectsFrom)
	{
		this.parent1 = prevRound.getMatch(childIndex * 2);
		this.parent2 = prevRound.getMatch(childIndex * 2 + 1);
	}
}

BrackChartMatch.prototype.updateDimensions = function()
{
	this.x = this.c.paddingX + this.xIndex * (this.lc.matchWidth + this.c.paddingX);

	if (this.hasParents())
	{
		this.y = (this.parent1.y + this.parent2.y) / 2;
	}
	else
	{
		this.y = this.yIndex == 0 ? this.c.paddingY :
			this.round.getMatch(this.yIndex - 1).y + this.lc.matchHeight + this.c.paddingY;
	}

	this.width = this.lc.matchWidth;
	this.height = this.lc.matchHeight;

	if (this.y > this.lc.lowestMatchY) this.lc.lowestMatchY = this.y;
}

BrackChartMatch.prototype.createLines = function()
{
	if (this.hasParents())
	{
		var p1w = this.parent1.winner;
		var p2w = this.parent2.winner;
		var off = this.lc.matchHeight / 4

		var p1y = this.parent1.y + this.lc.matchHeight / 2 + (p1w == 1 ? - off / 4 : p1w == 2 ? off : 0);
		var p2y = this.parent2.y + this.lc.matchHeight / 2 + (p2w == 1 ? - off / 4 : p2w == 2 ? off : 0);

		this.lines.push
		({
			'x': this.x - this.c.paddingX / 2,
			'y1': p1y,
			'y2': p2y
		})

		this.lines.push
		({
			'x1': this.x - this.c.paddingX,
			'x2': this.x - this.c.paddingX / 2,
			'y': p1y
		})

		this.lines.push
		({
			'x1': this.x - this.c.paddingX,
			'x2': this.x - this.c.paddingX / 2,
			'y': p2y
		})

		this.lines.push
		({
			'x1': this.x - this.c.paddingX / 2,
			'x2': this.x,
			'y': this.y + this.c.paddingY
		})
	}
}

BrackChartMatch.prototype.setIndex = function(xIndex, yIndex)
{
	this.xIndex = xIndex;
	this.yIndex = yIndex;
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
	this.winnerName = winner == null ? null : this["team" + winner];
}

BrackChartMatch.prototype.setInfo = function(info)
{
	this.info = info;
}

BrackChartMatch.prototype.hasParents = function()
{
	return this.parent1 || this.parent2;
}

function BrackChartRound()
{
	this.parent = null;
	this.index = null;
	this.matches = [];
}

BrackChartRound.prototype.setParent = function(parent)
{
	this.parent = parent;
}

BrackChartRound.prototype.setIndex = function(index)
{
	this.index = index;
}

BrackChartRound.prototype.createFromData = function(roundData)
{
	var childIndex = 0;

	for (let [i, matchData] of roundData.entries())
	{
		var match = new BrackChartMatch(this);
		match.c=this.c;match.lc=this.lc;
		match.setTeams(matchData.team1, matchData.team2);
		match.setScores(matchData.score1, matchData.score2);
		match.setWinner(matchData.winner);
		match.setInfo(matchData.info);
		match.setIndex(this.index, i);
		match.initParents(this.parent, matchData.connectsFrom, childIndex)
		match.updateDimensions();
		match.createLines();

		this.matches.push(match);

		console.log(matchData)

		if (!matchData.info.prev)
			childIndex++;
	}
}

BrackChartRound.prototype.getMatch = function(index)
{
	return this.matches[index];
}

function BrackChartRoundName(text, index)
{
	this.text = text;
	this.index = index;
}

BrackChartRoundName.prototype.createElement = function()
{
	var element = document.createElement("div");
	element.classList.add("BrackChart_title");
	element.style.top = this.c.paddingY + "px";
	element.style.left = this.c.paddingX + (this.lc.matchWidth + this.c.paddingX) * xIndex + "px";
	element.innerText = text;
}