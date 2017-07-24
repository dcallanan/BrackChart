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