function BrackChartRoundName(text, index)
{
	this.text = text;
	this.index = index;
}

BrackChartRoundName.prototype.createElement = function()
{
	var element = document.createElement("div");
	element.classList.add("brackChart_roundName");
	element.style.top = this.c.paddingY + "px";
	element.style.left = this.c.paddingX + (this.lc.matchWidth + this.c.paddingX) * xIndex + "px";
	element.innerText = text;
}