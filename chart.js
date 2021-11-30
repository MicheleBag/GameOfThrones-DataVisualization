
var width = 960,
    height = 600;


// Svg container
var svg = d3.select("svg")
    .attr("width",'100%')
    .attr("height", '100%')
    .call(d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }))
    .append("g")
    
const forceX = d3.forceX(width / 2).strength(0.1)
const forceY = d3.forceY(height / 2).strength(0.1)

var simulation = d3.forceSimulation()
    .force("link_lover", d3.forceLink().id(function (d) { return d.id; }))
    .force("link_killed", d3.forceLink().id(function (d) { return d.id; }))//.distance(300))
    .force("link_parents", d3.forceLink().id(function (d) { return d.id; }))//.distance(1))
    .force("link_spouse", d3.forceLink().id(function (d) { return d.id; }))
    .force("link_allegiance", d3.forceLink().id(function (d) { return d.id; }))
    .force("link_siblings", d3.forceLink().id(function (d) { return d.id; }))

    .force("charge", d3.forceManyBody().strength(-500))
//  .force("center", d3.forceCenter(width / 2, height / 2))
    .force('x', forceX)
    .force('y', forceY)

// import data
d3.xml("Dataset/got-dataset.xml", function (data) {
    var xml = d3.select(data.documentElement);
    var nodes = xml.selectAll("node")._groups[0];
    var edges = xml.selectAll("edge")._groups[0];
    graph = buildData(nodes, edges)
    
    filteredLover = graph.edges.filter(x => x.relation == "lover")
    filteredKilled = graph.edges.filter(x => x.relation == "killed")
    filteredParents = graph.edges.filter(x => x.relation == "father" || x.relation == "mother")
    filteredSpouse = graph.edges.filter(x => x.relation == "spouse")
    filteredAllegiance = graph.edges.filter(x => x.relation == "allegiance")
    filteredSiblings = graph.edges.filter(x => x.relation == "sibling")
    var links = [filteredKilled, filteredSiblings, filteredLover, filteredParents, filteredSpouse, filteredAllegiance]

    svgLink = setSvgLink(links);

    //arrow
    svg.append("svg:defs").append("svg:marker")
    .attr("id", "triangle")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("markerUnits","userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-3L6,0L0,3")
    .style("fill", "black");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 6)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.name; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

 
    simulation.force("link_lover")
        .links(filteredLover);
    simulation.force("link_killed")
        .links(filteredKilled);
    simulation.force("link_parents")
        .links(filteredParents);
    simulation.force("link_spouse")
        .links(filteredSpouse);
    simulation.force("link_allegiance")
        .links(filteredAllegiance);
    simulation.force("link_siblings")
        .links(filteredSiblings);
    
    

    function ticked() {
        for(i=0; i<svgLink.length; i++){
            svgLink[i]
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
        }

        node
            .attr("r", 20)
            .style("fill", "#d9d9d9")
            .style("stroke", "#969696")
            .style("stroke-width", "1px")
            .attr("cx", function (d) { return d.x + 6; })
            .attr("cy", function (d) { return d.y - 6; });

        label
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .style("font-size", "20px").style("fill", "#4393c3");
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    
}

function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
    
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null
    d.fy = null
}

function getNodeHouse(){
    console.log(graph.nodes)
    const house = graph.nodes.reduce((house_birth, value) => {
        if (!house_birth[value["house-birth"]]) {
          house_birth[value["house-birth"]] = [];
        } 
        house_birth[value["house-birth"]].push(value);
        return house_birth;
      }, {});
    houseNames = house.forEach()
}

function setSvgLink(links){
    var color_codes = {"violet": "#ff00ee", "red": "#ff1900", "blue": "#003cff", "pink": "#ff9494", "green": "#009614"}
    var colors = [color_codes.red, color_codes.blue, color_codes.violet, color_codes.blue, color_codes.pink, color_codes.green]
    svgLink = []
    console.log(links[2])
    for(i=0; i<links.length; i++){
        if(i > 1){
        svgLink[i] = svg.append("g")
            .style("stroke", colors[i])
            .selectAll("line")
            .data(links[i])
            .enter().append("line");
        }
        else{
            svgLink[i] = svg.append("g")
            .style("stroke", colors[i])
            .selectAll("line")
            .data(links[i])
            .enter().append("line")
            .attr("marker-end", "url(#triangle)");
        }
    }
    
    return svgLink
}



function buildData(nodes, edges) {
    // output graph
    var graph = {
        "nodes": [],
        "edges": []
    }

    // merge both set to avoid redundant code
    var list = [nodes, edges]
    var nodesLength = nodes.length
    var workingOnEdges = false
    // for each xml childnode create a new row in attributes obj 
    // and than push it into nodes/edges

    list.forEach(category => {
        category.forEach(element => {
            if (category.length > nodesLength) workingOnEdges = true
            var attributes = {}
            element.childNodes.forEach(childNode => {
                // check if it's a useful datafield
                if (childNode.nodeValue == null) {
                    attributes[childNode.attributes.key.nodeValue] = childNode.innerHTML
                    if (!workingOnEdges) attributes["id"] = element.attributes.id.nodeValue
                    // add edge endpoints
                    if (workingOnEdges) {
                        attributes["source"] = element.attributes.source.nodeValue
                        attributes["target"] = element.attributes.target.nodeValue
                        if (element.attributes.directed != undefined)
                            attributes["directed"] = element.attributes.directed.nodeValue
                        else attributes["directed"] = true
                    }
                }
            });
            if (!workingOnEdges) graph.nodes.push(attributes)
            else graph.edges.push(attributes)
        });
    });
    return graph
}






