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