/* TODO : 
// - risolvere bug ordine colori
// 
*/

var width = 960,
	height = 600;

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

const forceX = d3.forceX(width / 2).strength(0.1);
const forceY = d3.forceY(height / 2).strength(0.1);

var simulation = d3
	.forceSimulation()
	/*.force(
		"link_lover",
		d3.forceLink().id(function (d) {
			return d.id;
		})
	)
	.force(
		"link_killed",
		d3.forceLink().id(function (d) {
			return d.id;
		})
	)
	.force(
		"link_parents",
		d3.forceLink().id(function (d) {
			return d.id;
		})
	)
	.force(
		"link_spouse",
		d3
			.forceLink()
			.id(function (d) {
				return d.id;
			})
			.distance(20)
	)
	.force(
		"link_allegiance",
		d3.forceLink().id(function (d) {
			return d.id;
		})
	)
	.force(
		"link_siblings",
		d3.forceLink().id(function (d) {
			return d.id;
		})
	)*/

	.force("charge", d3.forceManyBody().strength(-500))
	//  .force("center", d3.forceCenter(width / 2, height / 2))
	.force("x", forceX)
	.force("y", forceY);

// import data
d3.xml("Dataset/got-dataset.xml", function (data) {
	var xml = d3.select(data.documentElement);
	var nodes = xml.selectAll("node")._groups[0];
	var edges = xml.selectAll("edge")._groups[0];

	graph = buildData(nodes, edges);
	//console.log(graph.edges);

	filteredLover = graph.edges.filter((x) => x.relation == "lover");
	filteredKilled = graph.edges.filter((x) => x.relation == "killed");
	filteredParents = graph.edges.filter(
		(x) => x.relation == "father" || x.relation == "mother"
	);
	filteredSpouse = graph.edges.filter((x) => x.relation == "spouse");
	filteredAllegiance = graph.edges.filter((x) => x.relation == "allegiance");
	filteredSiblings = graph.edges.filter((x) => x.relation == "sibling");
	var links = [];
	var duplicatedLinks = [];

	d3.selectAll(".filter_button").on("change", function () {
		d3.selectAll(".link").remove();

		links = [];
		simulation.force("link_lover", null);
		simulation.force("link_killed", null);
		simulation.force("link_parents", null);
		simulation.force("link_spouse", null);
		simulation.force("link_allegiance", null);
		simulation.force("link_siblings", null);

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

		var checkedBoxes = getCheckedBoxes("checkbtn");
		//console.log(checkedBoxes);
		if (checkedBoxes != null) {
			checkedBoxes.forEach((element) => {
				switch (element) {
					case "lover":
						links.push(filteredLover);
						simulation.force(
							"link_lover",
							d3.forceLink(filteredLover).distance(50)
						);
						break;

					case "family":
						links.push(filteredParents);
						links.push(filteredSiblings);
						simulation.force(
							"link_parents",
							d3.forceLink(filteredParents).distance(100)
						);
						simulation.force(
							"link_siblings",
							d3.forceLink(filteredSiblings).distance(100)
						);
						break;

					case "killed":
						links.push(filteredKilled);
						simulation.force(
							"link_killed",
							d3.forceLink(filteredKilled).distance(100)
						);
						break;

					case "spouse":
						links.push(filteredSpouse);
						simulation.force(
							"link_spouse",
							d3.forceLink(filteredSpouse).distance(50)
						);
						break;

					case "allegiance":
						links.push(filteredAllegiance);
						simulation.force(
							"link_allegiance",
							d3.forceLink(filteredAllegiance).distance(50)
						);
						break;
					default:
						break;
				}
			});

			svgLink = setSvgLink(links);
			duplicatedLinks = getDuplicatedLinks(links);
		}
		if (!d3.event.active) {
			simulation.alpha(1).restart();
		}
	});

	svgLink = setSvgLink(links);

	//arrow
	svg
		.append("svg:defs")
		.append("svg:marker")
		.attr("id", "triangle")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 10.5)
		.attr("refY", 0)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("markerUnits", "userSpaceOnUse")
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,-2L4,0L0,2")
		.style("fill", "black");

	/*
    OLD CODE
    var node = svg
		.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(graph.nodes)
		.enter()
		.append("circle")
		.attr("r", 6)
		.call(
			d3
				.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
		);
    */
	house_names = getHouseNames(graph);
	svgNode = setSvgNode(graph.nodes, house_names);

	var label = svg
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(graph.nodes)
		.enter()
		.append("text")
		.attr("class", "label")
		.text(function (d) {
			return d.name;
		});

	simulation.nodes(graph.nodes).on("tick", ticked);

	/*
	simulation.force("link_lover").links(filteredLover);
	simulation.force("link_killed").links(filteredKilled);
	simulation.force("link_parents").links(filteredParents);
	simulation.force("link_spouse").links(filteredSpouse);
	simulation.force("link_allegiance").links(filteredAllegiance);
	simulation.force("link_siblings").links(filteredSiblings);
    */

	function ticked() {
		//edge
		for (i = 0; i < svgLink.length; i++) {
			svgLink[i].attr("d", function (d) {
				dx = d.target.x - d.source.x;
				dy = d.target.y - d.source.y;
				if (duplicatedLinks.includes(d))
					dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
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

			/*
                .attr("x1", function (d) {
					return d.source.x;
				})
				.attr("y1", function (d) {
					return d.source.y;
				})
				.attr("x2", function (d) {
					return d.target.x;
				})
				.attr("y2", function (d) {
					return d.target.y;
				});
                */
		}

		//node
		for (i = 0; i < svgNode.length; i++) {
			svgNode[i]
				.attr("x", function (d) {
					return d.x - 35;
				})
				.attr("y", function (d) {
					return d.y - 35;
				});
		}

		/*
        OLD CODE
        node
			.attr("r", 20)
			.style("fill", "#d9d9d9")
			.style("stroke", "#969696")
			.style("stroke-width", "1px")
			.attr("cx", function (d) {
				return d.x;
			})
			.attr("cy", function (d) {
				return d.y;
			});
        */

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

function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

function getHouseNames(graph) {
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

function setSvgLink(links) {
	var colors = {
		lover: "#ff00ee", // violet
		killed: "#ff1900", // red
		father: "#003cff", // blue
		mother: "#003cff", // blue
		sibling: "#003cff", // blue
		spouse: "#ff9494", // pink
		allegiance: "#009614", // green
	};

	svgLink = [];
	directedRelations = ["killed", "father", "mother"];

	for (i = 0; i < links.length; i++) {
		let relationType = links[i][0].relation;
		if (directedRelations.includes(relationType)) {
			svgLink[i] = svg
				.append("g")
				.attr("class", "link")
				.style("stroke", colors[relationType])
				.style("fill-opacity", 0)
				.selectAll("path")
				.data(links[i])
				.enter()
				.append("path")
				.attr("marker-end", "url(#triangle)");
		} else {
			svgLink[i] = svg
				.append("g")
				.attr("class", "link")
				.style("stroke", colors[relationType])
				.style("fill-opacity", 0)
				.selectAll("path")
				.data(links[i])
				.enter()
				.append("path");
		}
	}
	return svgLink;
}

function setSvgNode(nodes, houseNames) {
	svgNode = [];
	for (i = 0; i < houseNames.length; i++) {
		svgNode[i] = svg
			.append("g")
			.attr("class", "nodes")
			.selectAll("image")
			.data(nodes.filter((x) => x["house-birth"] == houseNames[i]))
			.enter()
			.append("image")
			.attr("xlink:href", "housesImages/" + houseNames[i] + ".png")
			.attr("width", 70)
			.attr("height", 70)
			.call(
				d3
					.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended)
			);

		console.log(houseNames[0]);
	}

	return svgNode;
}

function getDuplicatedLinks(links) {
	var allLinks = [];
	links.forEach((e) => {
		e.forEach((link) => {
			allLinks.push(link);
		});
	});

	var duplicatedLinks = [];
	for (let i = 0; i < allLinks.length; i++) {
		const edge = allLinks[i];
		for (let j = i + 1; j < allLinks.length; j++) {
			const edge2 = allLinks[j];
			if (edge.source == edge2.source && edge.target == edge2.target)
				duplicatedLinks.push(edge);
		}
	}
	return duplicatedLinks;
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
					attributes[childNode.attributes.key.nodeValue] = childNode.innerHTML;
					if (!workingOnEdges)
						attributes["id"] = element.attributes.id.nodeValue;

					if (childNode.attributes.key.nodeValue == "group") {
						if (attributes["house-birth"] == undefined)
							attributes["house-birth"] = childNode.innerHTML;
					}
					// add edge endpoints
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
