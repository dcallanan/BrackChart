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











/*BrackChart.prototype.updateMatchDimensions = function()
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

	if (match.data["moreInfo"] !== undefined && match.data["moreInfo"].length > 0)
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

	return scores;
}

BrackChart.prototype.drawMatchBoxInfo = function(match)
{
	var info = document.createElement("div");
	info.classList.add("BrackChart_info");

	if (match.data["moreInfo"] !== undefined)
	{
		for (var inf of match.data["moreInfo"])
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
	flag.classList.add("BrackChart_flag");* /

	var colors = BrackChart_gl_FLAGS[name];

	if (colors)
	{
		if (Array.isArray(colors))
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
			console.log("img");
			var flag_img = document.createElement("img");
			flag_img.src = colors;
			flag_img.style.width = "50px";
			flag_img.style.height = "45px";
			team.appendChild(flag_img);
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

	if (match.data["moreInfo"] !== undefined && match.data["moreInfo"].length > 0)
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
}*/

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