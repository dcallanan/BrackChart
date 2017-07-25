function BrackChartFlagBuilder() {}

BrackChartFlagBuilder.prototype.build = function(flag)
{
	var container = document.createElement("div");

	if (flag)
		if (Array.isArray(flag))
		{
			for (var color of flag)
				this.buildPiece(container, 48 / flag.length, color)

			var last = flag[flag.length - 1];

			if (last == "ffffff")
			{
				this.buildPiece(container, 1, last)
				this.buildPiece(container, 1, "ccc");
			}
			else
				this.buildPiece(container, 2, last);
		}
		else
			this.buildImage(container, flag);
	else
		this.buildPiece(container, 50, "444");

	return container;
}

BrackChartFlagBuilder.prototype.buildPiece = function(element, width, color)
{
	var flagPiece = document.createElement("div");
	flagPiece.classList.add("brackChart_flagPiece");
	flagPiece.style.backgroundColor = "#" + color;
	flagPiece.style.width = width + "px";
	element.appendChild(flagPiece);
}

BrackChartFlagBuilder.prototype.buildImage = function(element, img_src)
{
	var flag = new Image();
	flag.classList.add("brackChart_flagPiece");
	flag.style.width = "50px";
	flag.src = img_src;
	element.appendChild(flag);
}