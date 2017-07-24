function BrackChartElementFactory(element)
{
	this.element = element;
	this.flagBuilder = new BrackChartFlagBuilder();
	element.innerHTML = "";

	while (element.firstChild)
    	element.removeChild(element.firstChild);
}

BrackChartElementFactory.prototype.createMatch = function(match)
{
	var node = document.createElement("div");
	node.classList.add("brackChart_match");
	node.style.width = match.width + "px";
	node.style.height = match.height + "px";
	node.style.top = match.y + "px";
	node.style.left = match.x + "px";

	var team1 = this.createMatchTeam(match.team1, match.score1, match.winner == 1);
	var team2 = this.createMatchTeam(match.team2, match.score2, match.winner == 2);
	var info = this.createMatchInfo(match.info);

	var scores = document.createElement("div");
	scores.classList.add("brackChart_generalInfo");
	scores.appendChild(team1);
	scores.appendChild(info.element);
	scores.appendChild(team2);

	node.appendChild(scores);

	if (match.info.moreInfo && match.info.moreInfo.length > 0)
	{
		var backButton = document.createElement("div");
		backButton.classList.add("brackChart_backButton");
		backButton.innerText = "BACK";
		backButton.style.top = this.lc.matchHeight - 35 + "px";
		backButton.style.width = this.lc.matchWidth + "px";

		backButton.onmousedown = () => backButton.classList.add("active");
		backButton.addEventListener("transitionend", () => backButton.classList.remove("active"));
		backButton.addEventListener("webkitTransitionEnd", () => backButton.classList.remove("active"));

		var moreInfo = document.createElement("div");
		moreInfo.classList.add("brackChart_moreInfo");
		
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

	if (match.winner)
	{
		console.log("WINNER")
		var line = document.createElement("div");
		line.classList.add("brackChart_winnerLine");

		if (match.winner == 1)
		{
			line.style.top = "33px";
			line.style.left = "173px";
		}
		else
		{
			line.style.bottom = "10px";
			line.style.left = "173px";
		}

		scores.appendChild(line);
	}

	if (match.info.prev)
	{
		node.classList.add("prev");

		var bubble = document.createElement("div");
		bubble.classList.add("brackChart_prevBubble");
		bubble.innerText = match.info.prev;
		bubble.style.top = match.y + this.lc.matchHeight + 5 + "px";
		bubble.style.left = match.x + "px";
		this.element.appendChild(bubble);

		node.onmouseenter = function()
		{
			bubble.classList.add("visible");
		}

		node.onmouseleave = function()
		{
			bubble.classList.remove("visible");
		}
	}

	this.element.appendChild(node);
}

BrackChartElementFactory.prototype.createMatchInfo = function(info)
{
	var button = null;

	var element = document.createElement("div");
	element.classList.add("brackChart_info");

	var time = document.createElement("div");
	time.classList.add("brackChart_time");
	time.innerHTML = info.time;

	var date = document.createElement("div");
	date.classList.add("brackChart_date");
	date.innerHTML = info.date;

	element.appendChild(time);
	element.appendChild(date);

	if (info.moreInfo !== undefined && info.moreInfo.length > 0)
	{
		button = document.createElement("div");
		button.classList.add("brackChart_moreInfoButton");
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
	element.classList.add("brackChart_moreInfoText");
	element.innerText = text;

	return element;
}

BrackChartElementFactory.prototype.createMatchTeam = function(name, score, isWinner)
{
	var team = document.createElement("div");
	team.classList.add("brackChart_team");

	var flag = brackChart_flags[name];
	var flagElement = this.flagBuilder.build(flag);
	team.appendChild(flagElement);
	
	var teamName = document.createElement("div");
	teamName.classList.add("brackChart_teamName");
	teamName.innerHTML = name;

	var teamScore = document.createElement("div");
	teamScore.classList.add("brackChart_teamScore");
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
	node.classList.add("brackChart_line");

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