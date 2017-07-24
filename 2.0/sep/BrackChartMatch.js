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