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