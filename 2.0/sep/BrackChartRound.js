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