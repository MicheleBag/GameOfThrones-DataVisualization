// svg size
var width = document.getElementById("svg_container").clientWidth,
	height = document.getElementById("svg_container").clientHeight;

// Svg container
var svg = d3
	.select("svg")
	.attr("width", "100%")
	.attr("height", "100%")
	.call(
		d3.zoom().on("zoom", function () {
			svg.attr("transform", d3.event.transform);
		})
	)
	.append("g");

// gravity
const forceX = d3.forceX(width / 2).strength(0.1);
const forceY = d3.forceY(height / 2).strength(0.1);

// charge is set with range input, default=500
var charge = 500;
// init force simulation
var simulation = d3
	.forceSimulation()
	.force("initial_charge", d3.forceManyBody().strength(-1000))
	.force("x", forceX)
	.force("y", forceY);

// import data
d3.xml("Dataset/got-dataset.xml", function (data) {
	var xml = d3.select(data.documentElement);
	var nodes = xml.selectAll("node")._groups[0];
	var edges = xml.selectAll("edge")._groups[0];

	// get graph in a more useful format (like json instead of xml)
	graph = buildData(nodes, edges);

	// edges filtered by relation type
	filteredLover = graph.edges.filter((x) => x.relation == "lover");
	filteredKilled = graph.edges.filter((x) => x.relation == "killed");
	filteredParents = graph.edges.filter(
		(x) => x.relation == "father" || x.relation == "mother"
	);
	filteredSpouse = graph.edges.filter((x) => x.relation == "spouse");
	filteredAllegiance = graph.edges.filter((x) => x.relation == "allegiance");
	filteredSiblings = graph.edges.filter((x) => x.relation == "sibling");

	var links = [];
	var nodsList = graph.nodes;
	// all nodes in array based on houses
	var nods = allNodesByHouses(graph);

	// list of all house names
	house_names = getHouseNames(graph);

	// name of char with no house-birth
	undefined_names = getUndefinedNames(graph);
	filteredHouse = house_names.concat(undefined_names);

	// multiple edges on same node will be bended
	var multipleLinks = [];

	// handling edge filtering
	d3.selectAll(".filter_relation").on("change", function () {
		links = [];
		//remove all links from svg
		d3.selectAll(".link").remove();
		// delete link forces
		simulation.force("link_lover", null);
		simulation.force("link_killed", null);
		simulation.force("link_parents", null);
		simulation.force("link_spouse", null);
		simulation.force("link_allegiance", null);
		simulation.force("link_siblings", null);

		var checkedBoxes = getCheckedBoxes("checkbtn_rel");

		if (checkedBoxes != null) {
			checkedBoxes.forEach((element) => {
				// set forces of selected relation
				switch (element) {
					case "lover":
						links.push(filteredLover);
						simulation.force(
							"link_lover",
							d3.forceLink(filteredLover).distance(100)
						);
						break;

					case "family":
						links.push(filteredParents);
						links.push(filteredSiblings);
						simulation.force(
							"link_parents",
							d3.forceLink(filteredParents).distance(300)
						);
						simulation.force(
							"link_siblings",
							d3.forceLink(filteredSiblings).distance(300)
						);
						break;

					case "killed":
						links.push(filteredKilled);
						simulation.force(
							"link_killed",
							d3.forceLink(filteredKilled).distance(300)
						);
						break;

					case "spouse":
						links.push(filteredSpouse);
						simulation.force(
							"link_spouse",
							d3.forceLink(filteredSpouse).distance(100)
						);
						break;

					case "allegiance":
						links.push(filteredAllegiance);
						simulation.force(
							"link_allegiance",
							d3.forceLink(filteredAllegiance).distance(300)
						);
						break;
					default:
						break;
				}
			});

			// get multiple links on same nodes
			multipleLinks = getMultipleLinks(links);
			// filter links with endpoint exists in the simulation
			links = getExistingsLinks(nods, links);
			// links to draw
			svgLink = setSvgLink(links);
		}
		if (!d3.event.active) {
			simulation.alpha(1).restart();
		}
	});

	// handling nodes filtering
	d3.selectAll(".filter_house").on("change", function () {
		// nods contains all filtered nodes by house names
		nods = [];
		// # nods
		nNods = 0;
		// contains selected house names
		filteredHouse = [];
		d3.selectAll(".nodes").remove();
		d3.selectAll(".labels").remove();
		simulation.force("initial_charge", null);

		var checkedBoxes = getCheckedBoxes("checkbtn_nodes");
		if (checkedBoxes != null) {
			checkedBoxes.forEach((element) => {
				if (element == "undefined") {
					undefined_names.forEach((element) => {
						filteredHouse.push(element);
					});
					filteredNods = graph.nodes.filter(
						(x) => x["house-birth"] == undefined
					);
				} else {
					filteredHouse.push(element);
					filteredNods = graph.nodes.filter((x) => x["house-birth"] == element);
				}
				nods.push(filteredNods);
				nNods += filteredHouse.length;
			});
		} else {
			// no checkbox selected means all nodes rendered
			nods = allNodesByHouses(graph);
			filteredHouse = getHouseNames(graph).concat(getUndefinedNames(graph));
			nNods = graph.nodes.length;
		}

		// update label
		nodsList = [];
		for (let i = 0; i < nods.length; i++) {
			nods[i].forEach((element) => {
				nodsList.push(element);
			});
		}
		label = svg
			.append("g")
			.attr("class", "labels")
			.selectAll("text")
			.data(nodsList)
			.enter()
			.append("text")
			.attr("class", "label")
			.text(function (d) {
				return d.name;
			});

		svgNode = setSvgNode(graph.nodes, filteredHouse, house_names);
		// setting force based on #nodes rendered
		// charge is set by user
		forceNode = (-1500 * nNods) / graph.nodes.length - charge;
		simulation.force("initial_charge", d3.forceManyBody().strength(forceNode));

		// updating links
		var rel_chkboxs = d3.selectAll(".filter_relation");
		rel_chkboxs.dispatch("change");

		if (!d3.event.active) {
			simulation.alpha(1).restart();
		}
	});

	// on change range bar updates nodes force
	d3.select(".charge").on("change", function () {
		var range = document.getElementsByName("charge");
		charge = range[0].value;

		// updating nodes
		var node_chkboxs = d3.selectAll(".filter_house");
		node_chkboxs.dispatch("change");
	});

	// set initial nodes&edges to draw
	svgLink = setSvgLink(links, multipleLinks);
	svgNode = setSvgNode(graph.nodes, filteredHouse, house_names);

	// arrow for straight line
	svg
		.append("svg:defs")
		.append("svg:marker")
		.attr("id", "triangle")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 14.5)
		.attr("refY", 0)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("markerUnits", "userSpaceOnUse")
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,-2L4,0L0,2")
		.style("fill", "black");
	// arrow for bended line
	svg
		.append("svg:defs")
		.append("svg:marker")
		.attr("id", "triangle-bend")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 14.5)
		.attr("refY", -1)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("markerUnits", "userSpaceOnUse")
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,-2L4,0L0,2")
		.style("fill", "black");

	var label = svg
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(nodsList)
		.enter()
		.append("text")
		.attr("class", "label")
		.text(function (d) {
			return d.name;
		});

	//draw the nodes and links where they currently are in the simulation
	simulation.nodes(graph.nodes).on("tick", ticked);

	function ticked() {
		// define links path
		for (i = 0; i < svgLink.length; i++) {
			svgLink[i].attr("d", function (d) {
				dx = d.target.x - d.source.x;
				dy = d.target.y - d.source.y;
				if (multipleLinks.includes(d)) dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
				else dr = 0;

				return (
					"M" +
					d.source.x +
					"," +
					d.source.y +
					"A" +
					dr +
					"," +
					dr +
					" 0 0,1 " +
					d.target.x +
					"," +
					d.target.y
				);
			});
		}

		// define nodes position
		for (i = 0; i < svgNode.length; i++) {
			svgNode[i]
				.attr("x", function (d) {
					return d.x - 35;
				})
				.attr("y", function (d) {
					return d.y - 35;
				});
		}

		// define labels position
		label
			.attr("x", function (d) {
				return d.x + 40;
			})
			.attr("y", function (d) {
				return d.y + 10;
			})
			.style("font-size", "20px")
			.style("fill", "#00000");
	}
});

// define info tooltip that appears on mouse over node
var tooltip = d3
	.select("#container")
	.append("div")
	.style("position", "absolute")
	.style("visibility", "hidden")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "1px")
	.style("border-radius", "5px")
	.style("padding", "10px");

var dragActive = false;

function dragstarted(d) {
	dragActive = true;
	// hide tooltip with a fading animation
	tooltip.style("visibility", "hidden");
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	dragActive = false;
}

function dragged(d) {
	dragActive = true;
	// hide tooltip
	tooltip.style("visibility", "hidden");
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	dragActive = true;
	// hide tooltip
	tooltip.style("visibility", "hidden");
	d.fx = null;
	d.fy = null;
	dragActive = false;
}

// return all nodes grouped by house-birth
function allNodesByHouses(graph) {
	let house_names = getHouseNames(graph);
	let nodes = [];
	house_names.forEach((element) => {
		filteredNods = graph.nodes.filter((x) => x["house-birth"] == element);
		nodes.push(filteredNods);
	});

	return nodes;
}

// return list of all house names
function getHouseNames(graph) {
	// get all nodes based on house-birth with a reduce op
	const house = graph.nodes.reduce((house_birth, value) => {
		if (!house_birth[value["house-birth"]]) {
			house_birth[value["house-birth"]] = [];
		}
		house_birth[value["house-birth"]].push(value);
		return house_birth;
	}, {});
	houseNames = Object.keys(house);
	//add groups of nodes without a house-birth
	houseNames.push(undefined);

	return houseNames;
}

// return array name of nodes with house==undefined
function getUndefinedNames(graph) {
	// get all nodes based on house-birth with a reduce op
	const house = graph.nodes.reduce((house_birth, value) => {
		if (!house_birth[value["house-birth"]]) {
			house_birth[value["house-birth"]] = [];
		}
		house_birth[value["house-birth"]].push(value);
		return house_birth;
	}, {});
	undefinedNames = [];
	house.undefined.forEach((e) => {
		undefinedNames.push(e.name);
	});
	return undefinedNames;
}

function setSvgLink(links) {
	//set of color for edges
	var colors = {
		lover: "#f000e8", // violet
		killed: "#ff1900", // red
		father: "#003cff", // blue
		mother: "#003cff", // blue
		sibling: "#003cff", // blue
		spouse: "#8a4e00", // brown
		allegiance: "#009614", // green
	};

	svgLink = [];
	directedRelations = ["killed", "father", "mother"];
	// it needs to create a consistend svgLink array
	// when links[i].length is 0, an index is skipped!!
	emptyArraySkipped = 0;

	for (i = 0; i < links.length; i++) {
		// in case the first array length=0 and the second has elements
		if (links[i].length > 0) {
			// first element is enough because relation in the same array are the same
			let relationType = links[i][0].relation;
			// check if relation is oriented
			if (directedRelations.includes(relationType)) {
				//this svg draw the arrow at the end of the line
				svgLink[i - emptyArraySkipped] = svg
					.append("g")
					.attr("class", "link")
					.lower()
					.style("stroke", colors[relationType])
					.style("stroke-width", 3)
					.style("fill-opacity", 0)
					.selectAll("path")
					.data(links[i])
					.enter()
					.append("path")
					.attr("marker-end", (d) =>
						// if the link is the second with the second endpoints the arrow will be bended
						getMultipleLinks(links).includes(d)
							? "url(#triangle-bend)"
							: "url(#triangle)"
					);
			} else {
				svgLink[i - emptyArraySkipped] = svg
					.append("g")
					.lower()
					.attr("class", "link")
					.style("stroke", colors[relationType])
					.style("stroke-width", 3)
					.style("fill-opacity", 0)
					.selectAll("path")
					.data(links[i])
					.enter()
					.append("path");
			}
		} else emptyArraySkipped++;
	}

	return svgLink;
}

function setSvgNode(nodes, filtered_houseNames, houseNames) {
	svgNode = [];

	for (i = 0; i < filtered_houseNames.length; i++) {
		// check if selected housename are included in all housenames set
		// (undefined name are not included)
		if (houseNames.includes(filtered_houseNames[i])) {
			// nodes to draw
			svgNode[i] = svg
				.append("g")
				.attr("class", "nodes")
				.selectAll("image")
				.data(nodes.filter((x) => x["house-birth"] == filtered_houseNames[i]))
				.enter()
				.append("image")
				.attr("xlink:href", "housesImages/" + filtered_houseNames[i] + ".png")
				.attr("width", 70)
				.attr("height", 70)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.call(
					d3
						.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended)
				);
		} else {
			// nodes to draw with house==undefined
			svgNode[i] = svg
				.append("g")
				.attr("class", "nodes")
				.selectAll("image")
				.data(nodes.filter((x) => x["name"] == filtered_houseNames[i]))
				.enter()
				.append("image")
				.attr("xlink:href", "housesImages/" + filtered_houseNames[i] + ".png")
				.attr("width", 70)
				.attr("height", 70)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.call(
					d3
						.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended)
				);
		}
	}
	return svgNode;
}

// check if there are multiple edges on a couple of nodes in a set of links
function getMultipleLinks(links) {
	var allLinks = [];
	links.forEach((e) => {
		e.forEach((link) => {
			allLinks.push(link);
		});
	});

	var multipleLinks = [];
	for (let i = 0; i < allLinks.length; i++) {
		const edge = allLinks[i];
		for (let j = i + 1; j < allLinks.length; j++) {
			const edge2 = allLinks[j];
			if (
				(edge.source == edge2.source && edge.target == edge2.target) ||
				(edge.source == edge2.target && edge.target == edge2.source)
			)
				multipleLinks.push(edge);
		}
	}
	return multipleLinks;
}

// given nodes and links return a set of links which both endpoinds exists in set nodes
function getExistingsLinks(nodes, links) {
	var all_nodes = [];

	for (let i = 0; i < nodes.length; i++) {
		nodes[i].forEach((element) => {
			all_nodes.push(element.id);
		});
	}

	for (let i = 0; i < links.length; i++) {
		var links_to_remove = [];
		links[i].forEach((element, index) => {
			if (
				!(
					all_nodes.includes(element.source.id) &&
					all_nodes.includes(element.target.id)
				)
			) {
				links_to_remove.push(index);
			}
		});
		// remove links which nodes dont exists
		links[i] = links[i].filter((e) => !links_to_remove.includes(e.index));
	}
	return links;
}

// return checked checkboxes given checkboxs name
function getCheckedBoxes(chkboxName) {
	var checkboxes = document.getElementsByName(chkboxName);
	var checkboxesChecked = [];
	for (var i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			checkboxesChecked.push(checkboxes[i].defaultValue);
		}
	}
	return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

function buildData(nodes, edges) {
	// output graph
	var graph = {
		nodes: [],
		edges: [],
	};

	// merge both set to avoid redundant code
	var list = [nodes, edges];
	var nodesLength = nodes.length;
	var workingOnEdges = false;

	// for each xml childnode create a new row in attributes obj
	// and than push it into nodes/edges
	list.forEach((category) => {
		category.forEach((element) => {
			if (category.length > nodesLength) workingOnEdges = true;
			var attributes = {};
			element.childNodes.forEach((childNode) => {
				// check if it's a useful datafield
				if (childNode.nodeValue == null) {
					// insert node attributes and node id
					attributes[childNode.attributes.key.nodeValue] = childNode.innerHTML;
					if (!workingOnEdges)
						attributes["id"] = element.attributes.id.nodeValue;
					// handle undefined house-birth
					if (childNode.attributes.key.nodeValue == "group") {
						if (attributes["house-birth"] == undefined)
							attributes["house-birth"] = childNode.innerHTML;
					}
					// add edge endpoints & orientation info
					if (workingOnEdges) {
						attributes["source"] = element.attributes.source.nodeValue;
						attributes["target"] = element.attributes.target.nodeValue;
						if (element.attributes.directed != undefined)
							attributes["directed"] = element.attributes.directed.nodeValue;
						else attributes["directed"] = true;
					}
				}
			});
			if (!workingOnEdges) graph.nodes.push(attributes);
			else graph.edges.push(attributes);
		});
	});
	return graph;
}

// on mouse over render tooltip
var mouseover = function (d) {
	// check if user is dragging a node
	if (dragActive == false) {
		var house = d["house-birth"];
		var group = d["group"];
		if (house != undefined) {
			tooltip.html(
				"Name: " + d.name + "<br> Status: " + d.status + "<br> House: " + house
			);
		} else {
			tooltip.html(
				"Name: " + d.name + "<br> Status: " + d.status + "<br> Group: " + group
			);
		}
		tooltip.style("visibility", "visible");
		tooltip.transition().duration(200).style("opacity", "1");
		tooltip
			.style("top", event.pageY + 30 + "px")
			.style("left", event.pageX + "px");
	}
};

// on mouse out hide tooltip
var mouseout = function (d) {
	if (dragActive == false) {
		tooltip.transition().duration(200).style("opacity", "0");
		tooltip.style("visibility", "hidden");
	}
};
