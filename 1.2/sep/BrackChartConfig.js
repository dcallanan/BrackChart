var BrackChart_gl_WIDTH = 230;
var BrackChart_gl_HEIGHT = 130;
var BrackChart_gl_XSPACING = 60;
var BrackChart_gl_YSPACING = 30;
var BrackChart_gl_LINEW = 1;
var BrackChart_gl_WRAPPERPADDING = true;

function BrackChartConfig()
{
	this.width = 230;
	this.height = 130;
	this.paddingX = 60;
	this.paddingY = 30;
	this.lineWidth = 1;
	this.chartHasMargin = true;
}

BrackChartConfig.prototype.setMatchWidth = function(width)
{
	this.width = width;
}

BrackChartConfig.prototype.setMatchHeight = function(height)
{
	this.height = height;
}

BrackChartConfig.prototype.setPaddingX = function(padding)
{
	this.paddingX = padding;
}

BrackChartConfig.prototype.setPaddingY = function(padding)
{
	this.paddingY = padding;
}

BrackChartConfig.prototype.setLineWidth = function(width)
{
	this.lineWidth = width;
}

BrackChartConfig.prototype.setChartHasMargin = function(bool)
{
	this.chartHasMargin = bool == true ? true : bool === undefined ? true : false;
	console.log(this.chartHasMargin)
}

BrackChartConfig.prototype.use = function()
{
	BrackChart_gl_WIDTH = this.width;
	BrackChart_gl_HEIGHT = this.height;
	BrackChart_gl_XSPACING = this.paddingX;
	BrackChart_gl_YSPACING = this.paddingY;
	BrackChart_gl_LINEW = this.lineWidth;
	BrackChart_gl_WRAPPERPADDING = this.chartHasMargin;
}