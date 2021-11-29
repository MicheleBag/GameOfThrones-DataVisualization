var width = 640,
    height = 480;


// Here's were the code begins. We start off by creating an SVG
// container to hold the visualization. We only need to specify
// the dimensions for this container.
var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

d3.xml("Dataset/got-dataset.xml", function (data) {
    //console.log(data)

    var xml = d3.select(data.documentElement);
    var nodes = xml.selectAll("node")._groups[0];
    var edges = xml.selectAll("edge")._groups[0];

    graph = buildData(nodes, edges)
    console.log(graph)
});

function buildData(nodes, edges) {
    // output graph
    var graph = {
        "nodes": [],
        "edges": []
    }

    // merge both set to avoid redundant code
    var list = [nodes, edges]
    var nodesLength = nodes.length

    // for each xml childnode create a new row in attributes obj 
    // and than push it into nodes/edges
    list.forEach(category => {
        category.forEach(element => {
            var attributes = {}
            element.childNodes.forEach(childNode => {
                // check if it's a useful datafield
                if (childNode.nodeValue == null) {
                    attributes[childNode.attributes.key.nodeValue] = childNode.innerHTML
                }
            });
            if (category.length <= nodesLength) graph.nodes.push(attributes)
            else graph.edges.push(attributes)
        });
    });
    return graph
}






