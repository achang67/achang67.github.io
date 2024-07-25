
var ps_source_select_active = false;
var ps_source = null;

var ps_dest_select_active = false;
var ps_dest = null;

function reset_pathway_search() {
    ps_source_select_active = false;
    ps_source = null;

    ps_dest_select_active = false;
    ps_dest = null;

    $('#ps_source').hide();
    $('#ps_destination').hide();
    $('#ps_btn').html('PATHWAY SEARCH');
    $('#ps_source_mol_img').hide();
    $('#ps_destination_mol_img').hide();
    $('#ps_no_pathway').hide();
    $('#ps_pathway').html('');

    rebuild_core_data();
    filter_edges();
    update_graph_styles();
}

function start_pathway_search() {

    if(ps_source_select_active || ps_dest_select_active) {
        reset_pathway_search();
        return;
    }

    if(ps_source != null && ps_dest != null) {
        reset_pathway_search();
        return;
    }

    ps_source_select_active = true;

    $('#ps_source_busy').show();

    $('#ps_btn').html('CANCEL');
    $('#ps_source').show();
    $('#ps_source_header').html('Select source molecule');
}

function did_select_source(node_data) {
    ps_source_select_active = false;
    ps_source = node_data;

    $('#ps_source_busy').hide();
    $('#ps_source_header').html('Source Molecule');

    ps_dest_select_active = true;
    $('#ps_destination').show();
    $('#ps_destination_header').html('Select destination molecule');
    $('#ps_destination_busy').show();

    $('#ps_source_mol_img').attr('src', 'img/' + node_data.id + '.png');
    $('#ps_source_mol_img').show();
}

function did_select_dest(node_data) {
    ps_dest_select_active = false;
    ps_dest = node_data;

    $('#ps_destination_busy').hide();
    $('#ps_destination_header').html('Destination Molecule');

    $('#ps_btn').html('RESET');
    $('#ps_destination_mol_img').attr('src', 'img/' + node_data.id + '.png');
    $('#ps_destination_mol_img').show();

    var nn_nodes = [];
    var nn_edges = [];

    dataset_nodes.forEach(function(node) {
        nn_nodes.push(node.data.id.toString());
    });

    dataset_edges.forEach(function(edge) {
        nn_edges.push({id: edge.data.id, from: edge.data.source, to: edge.data.target, weight: edge.data.energy_forward});
    });

    var found_path = findMinWeightPath(nn_nodes, nn_edges, ps_source.id, ps_dest.id);

    ps_dest_select_active = false;
    ps_source_select_active = false;

    if(found_path === undefined) {
        $('#ps_no_pathway').show();
        return;
    }

    if(found_path.length > 0) {

        var path_edges = [];

        dataset_edges.forEach(function(edge) {
            if(found_path.includes(edge.data.id)) {
                path_edges.push(edge);
            }
        });

        cy.edges().remove();
        cy.add(path_edges);

        // Now build a table of the pathway
        var table = '<table class="table table-striped table-bordered table-hover">';

        table += '<thead><tr><th></th><th>Source</th><th>Destination</th><th>Energy Fw<br><small>kcal/mol</small></th></tr></thead>';
        table += '<tbody>';

        for (var i = 0; i < path_edges.length; i++) {
            var edge = path_edges[i];

            table += '<tr>';
            table += '<td>' + i + '</td>';
            table += '<td><img class="mol-preview-mini rounded" src="img/' + edge.data.source + '.png" /></td>';
            table += '<td><img class="mol-preview-mini rounded" src="img/' + edge.data.target + '.png" /></td>';
            table += '<td>' + edge.data.energy_forward + '</td>';
            table += '</tr>';
        }

        table += '</tbody>';
        table += '</table>';

        $('#ps_pathway').html(table);
    }
}

class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({val, priority});
        this.sort();
    };

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    };
}

  function findMinWeightPath(nodes, edges, startNode, endNode) {
    var distances = {};
    var previous = {};
    var pq = new PriorityQueue();
    var edgeLookup = {};

    // Reset distances and previous
    nodes.forEach(node => {
      distances[node] = node === startNode ? 0 : Infinity;
      previous[node] = null;
    });

    // Reset edgeLookup
    edges.forEach(edge => {
      edgeLookup[`${edge.from}-${edge.to}`] = edge;
    });

    pq.enqueue(startNode, 0);

    while(pq.values.length) {
      var dequeuedNode = pq.dequeue().val;
      if(dequeuedNode === endNode) {
        var path = [];
        var current = endNode;

        while(current !== startNode) {
          var prevNode = previous[current];
          var edgeKey = `${prevNode}-${current}`;
          path.push(edgeLookup[edgeKey].id);
          current = prevNode;
        }

        return path.reverse();
      }

      if(dequeuedNode || distances[dequeuedNode] !== Infinity) {
        edges.forEach(edge => {
          if(edge.from === dequeuedNode) {
            var candidate = Math.max(distances[dequeuedNode], edge.weight);
            var nextNode = edge.to;
            if(candidate < distances[nextNode]) {
              distances[nextNode] = candidate;
              previous[nextNode] = dequeuedNode;
              pq.enqueue(nextNode, candidate);
            }
          }
        });
      }
    }
  }
