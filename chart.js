var width = 960,
    height = 600;


// Svg container
var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

// import data
d3.xml("Dataset/got-dataset.xml", function (data) {
    var xml = d3.select(data.documentElement);
    var nodes = xml.selectAll("node")._groups[0];
    var edges = xml.selectAll("edge")._groups[0];
    graph = buildData(nodes, edges)
    console.log(graph)


    var link = svg.append("g")
        .style("stroke", "#aaa")
        .selectAll("line")
        .data(graph.edges)
        .enter().append("line");

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

    simulation.force("link")
        .links(graph.edges);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

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
    simulation.fix(d);
}

function dragged(d) {
    simulation.fix(d, d3.event.x, d3.event.y);
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    simulation.unfix(d);
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






