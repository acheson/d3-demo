/*  
    scatter.js
    03/26/13
    authors: Rob Acheson
             Jeff Fontas

brush code was grabbed from 

*/

var width = 340;
var height = 220;
var tmargin = 20;
var lmargin = 60;
var bmargin = 40;
var rmargin = 20;
var ptRadius = 3;
var updateArray = 0;
var scatter = d3.select("div#scatter-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);   

var axesDrawn = 0; //becomes 1 after drawing axes the first time



function updateScatter() {
    
    var scatterX = d3.scale
                    .linear()
                    // .pow().exponent(.50)
                    .domain([0, maxViews])
                    .range([ (0 + lmargin), (width - rmargin)]);

    var scatterY = d3.scale
                    .linear()
                    // .pow().exponent(.50)
                    .domain([0, maxRatings])
                    .range([ (height - bmargin), (0 + tmargin)]);
   
    // this section draws the scatter axes at the first call 
    if (axesDrawn == 0) {

        //define axes
        var scatterYAxis = d3.svg.axis()
                            .scale(scatterY)
                            .orient("left")
                            .tickFormat(d3.format("s"))
                            .ticks(5)
                            .tickSubdivide(4)
                            .tickSize(6, 3, 3);

        var scatterXAxis = d3.svg.axis()
                            .scale(scatterX)
                            .orient("bottom")
                            .tickFormat(d3.format("s"))
                            .ticks(6)
                            .tickSubdivide(4)
                            .tickSize(6, 3, 3);

        //draw axes
        scatter.append("g")
            .attr("class", "x scatterAxis")
            .attr("transform", "translate(0.5," + (scatterY(0) + 0.5) + ")")
            .call(scatterXAxis);

        scatter.append("g")
            .attr("class", "y scatterAxis")
            .attr("transform", "translate(" +  (scatterX(0)+ 0.5) + ", 0.5)")
            .call(scatterYAxis);

        //add labels
        scatter.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width/2 + rmargin)
            .attr("y", height - 2)
            .text("Total views on 1channel.ch");

        scatter.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle") 
            .attr("transform", "rotate(-90, " + (lmargin/2 - 10 )+ ", " + height/2 + ")")           
            .attr("x", lmargin/2)
            .attr("y", height/2)
            
            .text("Total ratings on IMDB");

        //add scatterplot points
        var circle = scatter.selectAll("circle")
            .data(films)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return scatterX(d.views); })
            .attr("cy", function(d) { return scatterY(d.ratings); })
            .attr("r", ptRadius);

        //define brushing function, call it
        var brushFn = d3.svg.brush()
            .x(scatterX)
            .y(scatterY)
            .on("brushstart", brushstart)
            .on("brush", brushmove)
            .on("brushend", brushend);

        scatter.append("g")
            .attr("class", "brush")
            .call(brushFn);

        axesDrawn = 1;
    }

    // clear the brush extent and formatting if there's anything going on
    scatter.selectAll(".selected").classed("none",true);
    
    function brushstart() {
        scatter.classed("selecting", true);
    }

    function brushmove() {
      var e = d3.event.target.extent();
      circle.classed("selected", function(d) { 
        return e[0][0] <= d.views && d.views <= e[1][0]
            && e[0][1] <= d.ratings && d.ratings <= e[1][1];
      });
    }

    function brushend() {    
        updateArray = [];  
        indicesArray = [];
        scatter.classed("selecting", !d3.event.target.empty());
        var tempArray = scatter.selectAll(".selected").data();
        if (tempArray.length > 0) {

            for (f in tempArray) {  
                updateArray.push(dataSource[(tempArray[f].rank-1)]);
                indicesArray.push(tempArray[f].rank-1);
            }

            parse(updateArray);

            shouldParse = false;
            highlightList(indicesArray);    
            
            
           
        }
    }
}