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