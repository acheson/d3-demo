/*  
	list.js
	03/26/13
	author: Rob Acheson

	Adapted from:
	http://jqueryui.com/selectable/#serialize
	http://stackoverflow.com/questions/3140017/how-to-programmatically-select-selectables-with-jquery-ui
	http://stackoverflow.com/questions/9278227/jquery-array-into-eq-function
	http://stackoverflow.com/questions/7031226/jquery-checkbox-change-and-click-event
*/


function initList() {
	
	var list = d3.select("nav#list-nav").append("ol")
		.attr("id", "selectable");

	var li = list.selectAll("li")
		.data(films)
			.enter()
			.append("li")
			.attr("class", "ui-widget-content")
			.text( function(d) { return d.rank.toString() + ". " + d.title} );

	$( "#selectable" ).selectable({
 		stop: function() {
    		$("#list-input").show(500);
    		$("#select-all").prop("checked", false);
    		
    		var filteredList = [];
    		$( ".ui-selected", this ).each(function() {
      			var index = $( "#selectable li" ).index( this );
      			filteredList.push(dataSource[index]);
    		});
         
    		if (shouldParse == true) {
    			parse(filteredList);	
    		}
    		shouldParse = true;
		}
	});
	highlightList(["all"]);

	// set initial checkbox to checked
	$("#select-all").prop("checked", true);	
}

/* Accepts an array of indices, "all" or "none" */
function highlightList(indices) {
	if(indices == "all") {
		performHighlightList($("#selectable"), $("li"));
	}
	else {
		var elements = $("#selectable li").filter(function() {
			return indices.indexOf($(this).index()) > -1;
		});
		
		performHighlightList($("#selectable"), elements);	
	}
}
function performHighlightList(container, elements) {
	// add unselecting class to all elements, except the ones to select
    $(".ui-selected", container).not(elements).removeClass("ui-selected").addClass("ui-unselecting");
    
    // add ui-selecting class to the elements to select
    $(elements).not(".ui-selected").addClass("ui-selecting");

    // trigger the mouse stop event (this will select all .ui-selecting elements, and deselect all .ui-unselecting elements)
	container.data("ui-selectable")._mouseStop(null);	
}

$("#select-all").change(function() {
	highlightList("all", true);
});

// don't allow uncheck - interact with the list instead
$("#select-all").click(function() {
	if (!$(this).prop("checked")) {
		$(this).prop("checked", true);
	}
});





















