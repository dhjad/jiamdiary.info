//delete graph
function deletecontextgraph(){
	d3.selectAll(".cg_contextgraphs").remove()
};

//create context network
function createcontextnetwork(graph,contextid){
	console.log(graph, contextid)

	var contextsvg = d3.select("#graph_context");

	var contextg = contextsvg.append("g")
													 .attr("class","cg_contextgraphs")
													 .attr("transform", zoom_init);

	var zoom_init = d3.zoomIdentity.translate(width/150, height/100).scale(0.7);//width/6, height/6, 0.8
	var zoom = d3.zoom().on("zoom", zoom_actions);

	contextsvg.call(zoom)
						.call(zoom.transform, zoom_init);


	// zoom
	function zoom_actions(){
		contextg.attr("transform", d3.event.transform)
	};

	// create arrow marker
	createcontextgraphmarker(contextsvg);

	// create simulation
	createnetworksimulation(graph,contextid,contextg);

	// make the neo-box draggable
	dragElement(document.getElementById("neo-box"));

	// create neo box head title string
	createboxheadtitle(graph,contextid);


};

// create neo box head title string
function createboxheadtitle(graph, contextid){
	var nodejson = graph.nodes;
	var contexts = nodejson.filter(function(d){
		return d.gid==contextid
	});
	var context_name = contexts[0].name;
	$("#neo-box-head-str").html(context_name)
};


// create simulation
function createnetworksimulation(graph,contextid,contextg){
	console.log(graph)
	simulation = d3.forceSimulation()
				   .force("link", d3.forceLink()
									.id(function(d) { return d.gid; })
									.strength(1)
									.distance(100))
				   .force("charge", d3.forceManyBody()
				   					  .strength(-300).distanceMax(700))//-20 .distanceMin(100)
				   .force("center", d3.forceCenter(width/2.3,height/2))//width/3, height/2
				   .force("x", d3.forceX(width).strength(0.01))//0.001
				   .force("y", d3.forceY(height).strength(0.01))//0.001

	createnetworkgraph(graph,contextid,contextg)	
};

// create networkgraph
function createnetworkgraph(graph,contextid,contextg){
	var radius = 10;

	var linkg = contextg.append("g")
											.attr("class","cg_links")

	var edgepaths = linkg.selectAll(".cg_edgepath")
											 .data(graph.links).enter()
											 .append("path")
											 .attr("class", "cg_edgepath")
											 .attr("id", function(d,i){
												 return "cg_edgepath"+i
											 })
											 .attr("marker-end", "url(#cg_contextarrowhead)")
											 .style("pointer-events","none")
											 .style("stroke","gray")
											 .call(d3.drag()
												 .on("start", dragstarted)
												 .on("drag", dragged)
												 .on("end", dragended_fixed));

	var edgelabels = linkg.selectAll(".cg_edgelabel")
												.data(graph.links).enter()
												.append("text")
												.attr("class","cg_edgelabel")
												.attr("id",function(d,i){
													return "cg_edgelabel"+i
												})
												.attr("font-size","0.2em")
												.attr("fill","#aaa")
												.style("pointer-events","none")

	edgelabels.append("textPath")
						.attr("xlink:href",function(d,i){
							return "#cg_edgepath"+i
						})
						.attr("startOffset","50%")
						.style("text-anchor","middle")
						.style("pointer-events","none")
						.text(function(d){
							return d.relation
						})
	
	var nodeg = contextg.append("g")
							 .attr("class","cg_nodes");
	
	var node = nodeg.selectAll(".cg_node")
									.data(graph.nodes).enter()
									.append("g")
									.attr("class","cg_node")
									.call(d3.drag()
										.on("start", dragstarted)
										.on("drag", dragged)
										.on("end", dragended_fixed));
	
	node.append("circle")
			.attr("class", function(d){
				if (d.gid==contextid){
					return "cg_thisnode cg_nodecircle_"+d.class
				}
				return "cg_nodecircle_"+d.class;
			})
			.attr("r", function(d){
				d.weight = edgepaths.filter(function(l){
					return l.target == d.gid
				}).size()
				if (d.class=="Entry"){
					return radius*0.7;
				} else if (d.class=="Lifestyle"){
					return radius*2+d.weight
				} else return radius*2
			})
			.attr("fill", function(d){
				if (d.gid==contextid){
					return "#8DD2FF"
				} else if (d.class=="Entry"){
					return "#666868"
				} else if (d.class=="Lifestyle"){
					return "#c4cedc"
				} else return "#F9FBFD" // neo-box-content background-color
			})
			.attr("stroke-width", "3px")
			.attr("stroke", function(d){
				if (d.class=="Entry"){
					return "#a8a8a8" // neo-box-content background-color
				} else if (d.class=="Lifestyle"){
					return "#a8a8a8"
				} else if (d.class=="Place"){
					return "#dec97c"
				} else if (d.class=="Slave"){
					return "#cca2df"
				} else if (d.class=="Person"){
					return "#d5859e"
				} else if (d.class=="Object"){
					return "#eb9800"
				} else if (d.class=="Book"){
					return "#8293b1"
				} else if (d.class=="Term"){
					return "#93b182"
				} else if (d.class=="Literature"){
					return "#b1a082"
				} else if (d.class=="Event"){
					return "#8CB182"
				} else return "gray"
			})
	
	node.attr("cursor", "pointer")


	text = contextg.append("g")
					.attr("class","cg_nodetexts")
					.selectAll(".cg_label-nodes")
					.data(graph.nodes).enter()
					.append("text")
					.attr("class", function(d){
						return "cg_label-nodes-"+d.class+" cg_label-nodes";
					})
					.attr("id", function(d){
						return "cg_label-nodes-"+d.gid;
					})
					// .attr("textLength", radius*5)
					.html(function(d){
						if (d.class==="Entry"){
							var str = d.name;
							var newstr_date = str.replace(/(.*)년(.*)월(.*)일(내용\d)/g,"$1/$2/$3");
							var newstr_no = str.replace(/(.*)년(.*)월(.*)일(내용\d)/g,"$4");
							var newstr = "<tspan dy='0'>"+newstr_date+"</tspan><tspan dx='-3.5em' dy='1.2em'>"+newstr_no+"</tspan>"
							return str
							// return ""
						} else if(d.class=="Event"){
							return "사건"
						} else if(d.class=="Reference"){
							return d.resource
						} else return d.korname
					})
					.attr("dx",0)
					.attr("dy",radius-(radius/2))
					.attr("text-anchor","middle")
					.attr("cursor","pointer")
					.call(d3.drag()
						.on("start",dragstarted)
						.on("drag",dragged)
						.on("end",dragended_fixed));
	
	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);

	simulation
		.force("link")
		.links(graph.links);

	
	function ticked(){
		edgepaths
			.attr("d", function(d){
				return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
			});
		
		edgelabels.attr("transform",function(d){
			if(d.target.x<d.source.x){
				var bbox=this.getBBox();

				rx=bbox.x+bbox.width/2;
				ry=bbox.y+bbox.height/2;
				return "rotate(180 "+rx+" "+ry+")";
			} else {
				return "rotate(0)";
			}
		})

		node
			.attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

		text
			.attr("x", function(d){return d.x})
			.attr("y", function(d){return d.y})
	};

	// entry node event
	creteentrynodeevent(radius);

};

function creteentrynodeevent(radius){
	d3.selectAll(".cg_nodecircle_Entry")
		.on("mouseover", function(d){
			var thisid = d3.select(this).data()[0].gid;
			
			d3.select(this)
				.transition()
				.attr("r",radius*2)

				d3.select("#cg_label-nodes-"+thisid)
					.transition()
					.style("display","initial")

				// $("#cg_label-nodes-"+thisid).css("display","initial")

		})

		.on("mouseout", function(d){
			var thisid = d3.select(this).data()[0].gid;
			d3.select(this)
				.transition()
				.attr("r",radius*0.7)
				.delay(900)

			d3.select("#cg_label-nodes-"+thisid)
				.transition()
				.style("display","none")
				.delay(900)
			
			// $("#cg_label-nodes-"+thisid)..css("display","none")
		})
};


// create arrow marker
function createcontextgraphmarker(contextsvg){
	contextsvg.append("defs")
						.attr("class","cg_contextgraphs")
						.append("marker")
						.attr("id","cg_contextarrowhead")
						.attr("viewBox","-0 -5 10 10")
						.attr("refX",26)//40
						.attr("refY",0)
						.attr("orient","auto")
						.attr("markerWidth",10)
						.attr("markerHeight",10)
						.attr("markerUnits","userSpaceOnUse")
						.attr("xoverflow","visible")
						.append("svg:path")
						.attr("class", "cg_markerarrow")
						.attr("d", "M 0,-5 L 10 ,0 L 0,5")
						.attr("fill","gray")
};


// drag functions
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
};

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
};

function dragended_released(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
};

function dragended_fixed(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = d.x;
	d.fy = d.y;
};


// make the neo-box draggable
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV: 
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
};