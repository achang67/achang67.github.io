

function edge_color(weight) {

    if(!pathway_coloring) {
        return OLIVE_GREEN;
    }

    if(weight > 70) {
        return MUTED_RED;
    }
    else if(weight > 50) {
        return BURNT_ORANGE;
    }
    else if(weight > 30) {
        return MUSTARD_YELLOW;
    }
    else {
        return OLIVE_GREEN;
    }
}

function edge_class_name(R1, R2, R3, R4) {

    var name = ''

    if(R2 > 0) {
        name += 'R2 ';
    }

    if(R3 > 0) {
        name += 'R3 ';
    }

    if(R4 > 0) {
        name += 'R4 ';
    }

    if(R1 > 0) {
        name += 'R1 '
    }

    return name
}


LAYOUT_ENGINES = 
{
    breadthfirst : {
        name: 'breadthfirst',
        directed: true,
        padding: 10,
        fit: true,
        spacingFactor: 3, // Increase this value to increase the height
    },
    grid : {
        name: 'grid',
    },
    circle : {
        name: 'circle',
    },
    cola: {
        name: 'cola',
        maxSimulationTime: 2000,
        nodeSpacing: 70,
        edgeLength: 150,
        fit: true,
        initialEnergyOnIncremental: 1.0 // Increase initial energy for faster layout
    },
    fcose: {
        name: 'fcose',
        quality: 'proof',
        animate: true,
        animationDuration: 1500,
        fit: true,
        nodeSeparation: 175,

    }
}

MUTED_RED = '#c04040'
BURNT_ORANGE = '#b35d1e'
MUSTARD_YELLOW = '#d8ca4c'
OLIVE_GREEN = '#6b8e23'
MID_GRAY = 'rgb(64,65,77)'

NODE_SELECTED_COLOR = '#fff';
EDGE_SELECTED_COLOR = '#fff';

function default_style() {
    return [
        {
            'selector': 'node',
            'style': {'background-color': MID_GRAY, 'border-width': 2, 'border-color': 'black', 'text-valign': 'center', 'text-halign': 'center', 'padding': '50%', 'width': 70, 'height': 70, 'text-outline-color': 'black', 'content': 'data(label)', 'font-size': 11}
        },

        {
            'selector': 'edge',
            'style': {'line-color': OLIVE_GREEN, 'target-arrow-shape': 'triangle', 'width': 5}
        },
        {
            'selector': '[label = 0]',
            'style': {'background-color': 'blue'}
        },
        {
            'selector': '[[degree >= 0]]',
            'style': {'width': 15, 'height': 15}
        },
        {
            'selector': '[[degree >= 4]]',
            'style': {'width': 35, 'height': 35, 'font-size': 13}
        },
        {
            'selector': '[[degree >= 8]]',
            'style': {'width': 45, 'height': 45, 'font-size': 15}
        },
        {
            'selector': '[[degree >= 12]]',
            'style': {'width': 60, 'height': 60, 'font-size': 17}
        },
        {
            'selector': '[weight > 30]',
            'style': {'line-color': edge_color(30)}
        },
        {
            'selector': '[weight > 50]',
            'style': {'line-color': edge_color(50)}
        },
        {
            'selector': '[weight > 70]',
            'style': {'line-color': edge_color(70)}
        },
    ];
}



function computed_style(selectedNode, selectedEdge) {

    var comp_style = [];

    if(selectedNode) {
        comp_style.push({
            'selector': '[id = "' + selectedNode.id + '"]',
            'style': {'background-color': NODE_SELECTED_COLOR}
        });
    }

    if(selectedEdge) {
        comp_style.push({
            'selector': '[id = "' + selectedEdge.id + '"]',
            'style': {
                'line-color': EDGE_SELECTED_COLOR
            },
        });
    }

    if(show_fw_bk) {
        comp_style.push({
            selector: 'edge',
            style: {
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle'
            }
        });
    }

    if(proportional_thickness) {

        var max_weight = 0;
        cy.edges().forEach(function(edge) {
            if(edge._private.data.weight > max_weight) {
                max_weight = edge._private.data.weight;
            }
        });
        
        cy.edges().forEach(function(edge) {
            //var weight = edge._private.data.weight;
            var occur = 0;
            var trajs = 1;
            if (R1Included) {
              occur += edge._private.data.R1_val;
              trajs += 100
            } 
            if (R2Included) {
              occur += edge._private.data.R2_val;
              trajs += 100
            } 
            if (R3Included) {
              occur += edge._private.data.R3_val;
              trajs += 100
            } 
            if (R4Included) {
              occur += edge._private.data.R4_val;
              trajs += 100
            } 
            var width = 50 * occur/trajs;
            if (isNaN(width) || width < 1.5) {
                var width = 1.5;
            }
            if (edge._private.data.id.includes("backward") && !show_fw_bk) {
                var width = 0;
            }
            comp_style.push({
                'selector': '[id = "' + edge._private.data.id + '"]',
                'style': {
                    'width': width,
                },
            });
            cy.nodes().forEach(function(node) {
              if (node._private.data.id == 0) {
                  comp_style.push({
                      'selector': '[id = "' + node._private.data.id + '"]',
                      'style': {
                          'width': 30,
                          'height': 30,
                      },

                  });
              }
              else if (node._private.data.id == edge._private.data.target) {
                  comp_style.push({
                      'selector': '[id = "' + node._private.data.id + '"]',
                      'style': {
                          'width': 2 * width + 15,
                          'height': 2 * width + 15,
                          'font-size': 10 + width/3
                      },

                  });
              }
            });
        });
        //cy.nodes().forEach(function(node) {
        //    //var weight = edge._private.data.weight;
        //    //var occur = 0;
        //    //var trajs = 1;
        //    //if (R1Included) {
        //    //  occur += edge._private.data.R1_val;
        //    //  trajs += 100
        //    //} 
        //    //if (R2Included) {
        //    //  occur += edge._private.data.R2_val;
        //    //  trajs += 100
        //    //} 
        //    //if (R3Included) {
        //    //  occur += edge._private.data.R3_val;
        //    //  trajs += 100
        //    //} 
        //    //if (R4Included) {
        //    //  occur += edge._private.data.R4_val;
        //    //  trajs += 100
        //    //} 
        //    var width = 50 * occur/trajs;
        //    if (isNaN(width) || width < 1.5) {
        //        var width = 1.5;
        //    }
        //    if (node._private.data.id.includes("backward") && !show_fw_bk) {
        //        var width = 0;
        //    }
        //    comp_style.push({
        //        'selector': '[id = "' + node._private.data.id + '"]',
        //        'style': {
        //            'width': width,
        //            'height': width,
        //        },
        //    });
        //});
    }
//function node_size(width) {
//    return width;
//}

    return default_style().concat(comp_style);
}
