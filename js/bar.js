/*  
    bar.js
    03/26/13
    author: Rob Acheson

    Adapted from 
    http://mbostock.github.com/d3/tutorial/bar-1.html
    http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html

*/
var barChartWidth = 880;
var barChartHeight = 220;
var barMargin = {top:10, left:0, bottom: 100, right:0};
var barWidth = barChartWidth - (barMargin.left + barMargin.right);
var barHeight = barChartHeight - (barMargin.top + barMargin.bottom);

var barChart = d3.select("div#bar-chart")
    .append("svg")
        .attr("class", "bar-chart")
        .attr("width", barChartWidth)
        .attr("height", barChartHeight)
    .append("g")
        .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

var axisDrawn = 0;

// compare function for sorting by views
function byViews(a,b) {
 if (a.views < b.views)
     return 1;
  if (a.views > b.views)
    return -1;
  return 0;
}

function updateBar() {
    sitesOrig = sites;
    sites.sort(byViews);

    var barMax = d3.max(sites, function(d) { return d.views;});

    var x = d3.scale.ordinal()
        .domain(d3.range(sites.length))
        .rangeBands([40,barWidth]);

    var y = d3.scale.linear()
        //.pow().exponent(.750)
        .domain([1, barMax])
        .domain([1, ((barMax*10)/9)])
        .range([1, barHeight]);

    var yInverse = d3.scale.linear()
        //.pow().exponent(.750)
        .domain([1, barMax])
        .domain([1, ((barMax*10)/9)])
        .range([barHeight, 1]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(sites.length);

    var yAxis = d3.svg.axis()
        .scale(yInverse)
        .orient("left")
        .ticks(5)
        .tickFormat(d3.format("s"))
        .tickSubdivide(2)
        .tickSize(6, 4, 2);

    var selection = barChart.selectAll("rect")
        .data(sites, function(d) {return d.name;});

    selection.enter().append("rect")
        .attr("class", "bar-mark")
        .attr("x", barWidth)
        .attr("y", barHeight)
        .style("fill", "red")
        .style("fill-opacity", 0.2)
        .style("stroke", "red")            
        .style("stroke-opacity", 0.3)
        .style("stroke-width", 1.0)
            
    selection.on("mouseover", handleMouseOverBar);
    selection.on("mouseout", handleMouseOut);  // this function is in map.js

    selection.transition()
        .duration(500)
        .attr("x", function(d,i) {  return x(i) - 0.5; })
        .attr("y", function(d) {return barHeight - y(d.views) - 0.5;})
        .attr("width", barWidth/sites.length - 5)
        .attr("height", function(d) {return y(d.views);});

    selection.exit()
        .transition()
            .duration(500)
            .attr("x", barWidth)
            .style("opacity", 0)
            .remove();

    var textSelection = barChart.selectAll("text")
        .data(sites, function(d) {return d.name;});

    textSelection.enter().append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", function(d, i) {  return "translate(" + (x(i) + (barWidth/sites.length)/2)  + "," + (barHeight + 10) + ") rotate(-65)";})
        .text(function(d, i) { return d.name;})   
        .style("font-size", "13px")
        .style("opacity", 0);
    textSelection.on("mouseover", handleMouseOverText);
    textSelection.on("mouseout", handleMouseOut);  // this function is in map.js

    textSelection.transition()
        .duration(500)
        .attr("transform", function(d, i) {  return "translate(" + (x(i) + (barWidth/sites.length)/2)  + "," + (barHeight + 2) + ") rotate(-65)";})
        .style("opacity", 1);

    textSelection.exit()
        .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

    //draw y axis -- draws first then transitions afterwards
    if (axisDrawn == 0) {
   
        barChart.append("g")
            .attr("class", "barAxis")
            .attr("transform", "translate(" + (x(0)-0.5) + "," + (y(0)- 1.5) + ")")
            .call(yAxis);

        axisDrawn = 1;

    } else {
        //transitions for axis
        barChart.select(".barAxis")
            .transition()
            .duration(0)
            .call(yAxis); 
    }
    sites = sitesOrig;
}

function handleMouseOverBar(e) {
    var currentBarMark = d3.select(this);
    highlightBar(e, currentBarMark);

    // make selection and highlight the map
    var mapCircle = d3.selectAll(".map-mark")
        .filter( function(d) { 
            if (d.name == e.name) {
                return this;
            }
        });
    highlightMap(e, mapCircle);

    var currentTextMark = barChart.selectAll("text")
        .filter( function(d) { 
            if (d.name == e.name) {
                return this;
            }
        });
    highlightText(e, currentTextMark);
}

function handleMouseOverText(e) {
    var currentTextMark = d3.select(this);
    highlightText(e, currentTextMark);

    var currentBarMark = d3.selectAll(".bar-mark")
        .filter( function(d) { 
            if (d.name == e.name) {
                return this;
            }
        });
    highlightBar(e, currentBarMark);

    // make selection and highlight the map
    var mapCircle = d3.selectAll(".map-mark")
        .filter( function(d) { 
            if (d.name == e.name) {
                return this;
            }
        });
    highlightMap(e, mapCircle);
}

function highlightBar(e, obj) {
    // dim others
    var selection = barChart.selectAll("rect")
        .transition()
            .duration(250)
            .style("fill", "#888")
            .style("fill-opacity", 0.2)
            .style("stroke", "#888")    
              .style("stroke-opacity", 0.3);
      
      // highlight current    
      obj.transition()
          .duration(250)
        .style("fill", "red")
        .style("fill-opacity", 0.5)
        .style("stroke", "red")
        .style("stroke-opacity", 1.0);
}

function highlightText(e, obj) {
    // dim others
    var selection = barChart.selectAll("text")
        .transition()
            .duration(250)
            .style("fill", "#888");
      
      // highlight current    
      obj.transition()
        .duration(250)
        .style("fill", "black");
}





