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