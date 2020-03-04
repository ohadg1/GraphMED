/** Represent the network in the project, and all the scripts that related to it **/


class NetworkClass {
    constructor(nodes_list, edge_list) {
        this.nodes = new vis.DataSet(nodes_list);
        this.edges = new vis.DataSet(edge_list);
    }
}

current_network_name = null; // The name of the current network (null if there is not any nets
networks_dict = {}; // Dictionary of all the networks.
network = null; // The current network

/***
 * Destroy the network
 */
function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function lighter(col, amt) {
    col = col.slice(1);
    amt = amt.slice(1);

    var num = parseInt(col, 16);
    num = num + parseInt(amt, 16);
    if (num > 16777215) {
        return "#ffffff";
    }
    if (num < 0) {
        return "#000000";
    }
    return "#" + num.toString(16);
}

/***
 * Print the list of the papers associated with the chosen edge.
 * @param data - Data of all the current network
 * @param params - Data about the user's chosen edge
 * @param s - The index of the first paper (inorder to support separate the list to number of pages)
 * @param len - max papers associated with the page
 * @param father_tag_id - the id of the father HTML element the list should be attached to.
 */
function print_papers_list(data, params, s, len, father_tag_id) {
    let edge_info = data.edges.get(params.edges[0]).info;
    let pmid_lists = []; // List pmids
    let sentencesID_lists = []; // List of lists of sentences ids.
    for (let i = s; i < s + len && i < edge_info.length; i++) {
        pmid_lists.push(edge_info[i][0].toString());
        sentencesID_lists.push(edge_info[i][1]);
    }

    //Create xhttp request
    let xhttp = new XMLHttpRequest();

    //add CSRF Token to the request (async)
    xhttp.open("POST", "getPaperDetails", true); //method, url, async
    xhttp.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));

    //Make the request
    let dict_data = {};
    dict_data['pmids'] = pmid_lists;
    dict_data['sentencesIDs'] = sentencesID_lists;
    xhttp.send(JSON.stringify(dict_data));

    //Handle the response
    xhttp.onreadystatechange = function () {
        //Check state is DONE (Meaning we got response from the server)
        if (xhttp.readyState === XMLHttpRequest.DONE) {
            let responseData = JSON.parse(xhttp.response); //Get the result
            let paperDetails = responseData['DETAILS'];
            let paperSentences = responseData['SENTENCES'];
            console.log(responseData);

            //Wrapper Div:
            let wrapper_div = document.createElement("div");
            wrapper_div.setAttribute("id", father_tag_id + "_paper_wrapper_div");

            //print the papers links
            for (let i = s; i < s + len && i < edge_info.length; i++) {
                e = document.createElement("a");

                if (paperDetails[i - s]['DOI'] !== undefined) {
                    e.setAttribute("href", "https://doi.org/" + paperDetails[i - s]['DOI']);
                }
                e.setAttribute("target", "_blank"); //Open in a new Tab
                e.setAttribute("data-tooltip", '#' + edge_info[i][0]); //pmid
                e.innerHTML += '<p><b> Paper ' + (i + 1).toString() + ': </b>' + paperDetails[i - s]['Title'] + '</p>';

                let timeout = null;
                $(e).on("mouseenter", function (e) {
                    let popoUp = $($(this).data("tooltip")).css({
                        top: e.pageY + 50
                    }).stop();


                    if (timeout != null) {
                        clearTimeout(timeout);
                    }

                    timeout = setTimeout(function () {
                        popoUp.show(100);
                    }, 1000);
                });

                $(e).on("mouseleave", function (e) {
                    if (timeout != null) {
                        clearTimeout(timeout);
                    }
                });


                wrapper_div.appendChild(e);

                //Pop up Div
                let div_element = document.createElement("div");
                div_element.setAttribute("id", edge_info[i][0].toString());
                div_element.setAttribute("style", "position: absolute; width:500px; display: none; background-color: white;border: 2px solid; border-radius:5%;");

                // div_element.
                div_element.appendChild(createCloseButtonElement(div_element.id + "gfhdrfclose:", function () {
                    div_element.style.display = "none";
                }));
                let div_content = document.createElement("div");
                div_content.innerHTML += '<h3>' + paperDetails[i - s]['Title'].toString() + '</h3>';
                div_content.innerHTML += '<p><b>Authors:</b>' + paperDetails[i - s]['AuthorList'].toString() + '</p>';
                div_content.innerHTML += '<p><b>Volume:</b>' + paperDetails[i - s]['Volume'].toString() + '</p>';
                div_content.innerHTML += '<p><b>Journal:</b>' + paperDetails[i - s]['FullJournalName'].toString() + '</p>';
                div_content.innerHTML += '<p><b>Publication date:</b>' + paperDetails[i - s]['PubDate'].toString() + '</p>';
                if (paperDetails[i - s]['DOI'] !== undefined)
                    div_content.innerHTML += '<p><b>DOI:</b>' + paperDetails[i - s]['DOI'].toString() + '</p>';
                else
                    div_content.innerHTML += '<p><b>DOI:</b>Does not exist</p>';
                div_content.innerHTML += '<p>Database:' + paperDetails[i - s]['RecordStatus'].toString() + '<br>PMID: ' + edge_info[i][0].toString() + '</p>';
                div_content.innerHTML += '<p><b><u>Supportive Sentences:</u></b></p>';

                if (paperSentences[i] !== undefined) {
                    // check if there is supportive sentences
                    paperSentences[i].forEach(element => div_content.innerHTML += '<p>' + element[0] + ": <i><mark>" + element[1].toString() + '</mark></i></p>');
                }

                div_element.appendChild(div_content);
                wrapper_div.appendChild(div_element);
            }
            wrapper_div.appendChild(document.createElement("hr")); //line separator);

            //Attach to father
            document.getElementById(father_tag_id).appendChild(wrapper_div);
        }
    };
}

/***
 *  Auxiliary script - the function removes all the elements that their father id is equal to  the given tag_id
 *  @param tag_id: parent element id.
 */
function removeAllChilds(tag_id) {
    const myNode = document.getElementById(tag_id);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

/**
 * For a given id and listener to onclick function, the function return a new HTML "close" btton with the given id and
 onclick listener
 @param id: The button id (should be unique. The behaviour is undefined otherwise)
 @param onClickFunction: pointer to a function that called anytime the button will be clicked.
 * **/
function createCloseButtonElement(id, onClickFunction) {
    let close_btm = document.createElement("button");
    close_btm.setAttribute("id", id);
    close_btm.setAttribute("style", "float: right; background-color: #f44336; color: white");
    close_btm.innerText = " X ";
    close_btm.onclick = onClickFunction;
    return close_btm
}

/***
 * @description: Create network from a given data, attach it to the network global variable, and draw it to the screen in
 an already existence element called "mynetwork'.
 * @requires: The function assume the existence of HTML element with `mynetwork` id
 * @param data: The data of the network.
 */
function draw(data) {
    destroy();
    nodes = [];
    edges = [];

    // create a network
    var container = document.getElementById('mynetwork');
    var options = {
        nodes: {
            color: {
                border: '#97C2FC',
                background: '#97C2FC',
                highlight: {border: '#97C2FC', background: '#D2E5FF'}
            },
        },
        edges: {
            color: {
                color: '#2B7CE9',
                highlight: '#848484',
            },
        },
        physics: {
            enabled: false
        },
        interaction: {
            navigationButtons: true,
            keyboard: false
        },
        layout: {randomSeed: 2}, // just to make sure the layout is the same when the locale is changed
        manipulation: {
            addNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Add Node";

                data.color = {
                    background: '#adff2f',
                    border: '#adff2f',
                    highlight: {background: '#d6ff99', border: '#adff2f'}
                };

                editNode(data, clearNodePopUp, callback);
            }
            ,
            editNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Edit Node";
                if (typeof (data.color.background) == 'undefined') {
                    data.color = {
                        border: '#97C2FC',
                        background: '#97C2FC',
                        highlight: {border: '#97C2FC', background: '#D2E5FF'}
                    };
                }
                editNode(data, cancelNodeEdit, callback);
            }
            ,
            addEdge: function (data, callback) {
                if (data.from == data.to) {
                    var r = confirm("Do you want to connect the node to itself?");
                    if (r != true) {
                        callback(null);
                        return;
                    }
                }
                data.color = {
                    color: '#000000',
                    highlight: '#848484',
                };
                document.getElementById('edge-operation').innerHTML = "Add Edge";
                data.label = null;
                data.info = [];
                editEdgeWithoutDrag(data, callback);
            }
            ,
            editEdge: {
                editWithoutDrag: function (data, callback) {
                    if (typeof (data.label) == 'undefined') {
                        data.label = null;
                    }
                    if (typeof (data.color) == 'undefined') {
                        data.color = {
                            color: '#000000',
                            highlight: '#848484',
                        };
                    }
                    document.getElementById('edge-operation').innerHTML = "Edit Edge";
                    editEdgeWithoutDrag(data, callback);
                }
            }
        }
    };
    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        let edge_info = data.edges.get(params.edges[0]).info;
        if (params.nodes.length === 0 && params.edges.length === 1) {
            var node_to = data.nodes.get(data.edges.get(params.edges[0]).to);
            var node_from = data.nodes.get(data.edges.get(params.edges[0]).from);

            const edge_id = data.edges.get(params.edges[0]).id;
            const div_id = "Edge_div_" + edge_id;

            //Avoid duplicate:
            if (document.getElementById(div_id) !== null) {
                return;
            }
            let global_paper_page_idx = 0;
            const PAPER_PER_PAGE = 2;

            //Edge DIV:
            let edge_div = document.createElement("div");
            edge_div.setAttribute("id", div_id);

            let close_btm = createCloseButtonElement("Edge_prev_btm_" + edge_id, function () {
                document.getElementById("eventSpan").removeChild(edge_div);
            });

            edge_div.appendChild(close_btm);
            edge_div.appendChild(document.createElement("br")); //Break line


            // Edge title
            let title_element = document.createElement("h2");
            title_element.setAttribute("id", "Edge_title_" + edge_id);
            title_element.setAttribute("style", "text-align: center");
            title_element.innerText = node_from.label + ' → ' + node_to.label;
            edge_div.appendChild(title_element);

            // Next & Prev buttons
            let prev_button = document.createElement("button");
            prev_button.setAttribute("id", "Edge_prev_btm_" + edge_id);
            prev_button.setAttribute("style", "float: left");
            prev_button.innerText = " ← ";

            prev_button.onclick = function () {
                if (global_paper_page_idx - PAPER_PER_PAGE >= 0) {
                    global_paper_page_idx -= PAPER_PER_PAGE;
                    edge_div.removeChild(document.getElementById(edge_div.id + "_paper_wrapper_div"));
                    print_papers_list(data, params, global_paper_page_idx, PAPER_PER_PAGE, edge_div.id);
                }
            };


            edge_div.appendChild(prev_button);

            let next_button = document.createElement("button");
            next_button.setAttribute("id", "Edge_next_btm_" + edge_id);
            next_button.setAttribute("style", "float: right");
            next_button.innerText = " → ";
            next_button.onclick = function () {
                if (global_paper_page_idx + PAPER_PER_PAGE < edge_info.length) {
                    global_paper_page_idx += PAPER_PER_PAGE;
                    edge_div.removeChild(document.getElementById(edge_div.id + "_paper_wrapper_div"));
                    print_papers_list(data, params, global_paper_page_idx, PAPER_PER_PAGE, edge_div.id);
                }
            };
            edge_div.appendChild(next_button);

            edge_div.appendChild(document.createElement("br")); //Break line
            edge_div.appendChild(document.createElement("br")); //Break line

            //Attach to father
            document.getElementById('eventSpan').appendChild(edge_div);

            print_papers_list(data, params, global_paper_page_idx, PAPER_PER_PAGE, edge_div.id);


        } else {
            //clear card
            removeAllChilds('eventSpan');
            document.getElementById('eventSpan').innerHTML = '';
        }
    });
}

/***
 * Function defined that functionality of editing a network's node.
 * @param data
 * @param cancelAction
 * @param callback
 */
function editNode(data, cancelAction, callback) {
    document.getElementById('node-name').value = data.label;
    document.getElementById('node-color').value = data.color.background;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

function clearNodePopUp() {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
}

function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data, callback) {
    data.label = document.getElementById('node-name').value;
    data.color = {
        border: document.getElementById('node-color').value,
        background: document.getElementById('node-color').value,
        highlight: {
            border: document.getElementById('node-color').value,
            background: lighter(document.getElementById('node-color').value, "#340000")
        }
    };
    clearNodePopUp();
    callback(data);
}

function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    document.getElementById('edge-label').value = data.label;
    document.getElementById('edge-color').value = data.color.color;
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp() {
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';
}

function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data, callback) {
    if (typeof data.to === 'object') {

        data.to = data.to.id;
    }
    if (typeof data.from === 'object') {
        data.from = data.from.id;
    }
    data.arrows = 'to';
    data.label = document.getElementById('edge-label').value;
    data.color = {color: document.getElementById('edge-color').value, highlight: '#848484'};
    clearEdgePopUp();
    callback(data);
}

/***
 * @description: load a new netwrok, by its name, from the global networks_dict variable. In addition the function
 * filter edges and nodes by a given filtering parameter.
 * After loading, the function also draw the network to the screen, under "mynetwork" element.
 * @param network_name - the name of the network to load
 * @param article_num - filter parameter.
 *
 * @requires: The function assume the existence of HTML element with `mynetwork` id.
 */
function loadNetwork(network_name, article_num) {
    //Load the new network
    var nodes = networks_dict[network_name].nodes;
    var edges = networks_dict[network_name].edges;

    shown_edg = networks_dict[network_name].edges.get({
        filter: function (item) {
            //return true;
            return (item["info"].length >= article_num);
        }
    });
    hidden_edg = networks_dict[network_name].edges.get({
        filter: function (item) {
            //return true;
            return (item["info"].length < article_num);
        }
    });

    for (e of shown_edg) {
        e.hidden = false;
    }
    for (e of hidden_edg) {
        e.hidden = true;
    }
    edges.update(hidden_edg);
    edges.update(shown_edg);

    var data = {
        nodes: nodes,
        edges: edges,
    };

    if (current_network_name != null) {
        document.getElementById(current_network_name).style.color = "gray";
    }

    current_network_name = network_name; //update to the new color
    $("#network_name").text(current_network_name);
    $(".has_network").show();
    $(".no_networks").hide();

    document.getElementById(current_network_name).style.color = "blue";
    //clear card
    removeAllChilds('eventSpan');
    document.getElementById('eventSpan').innerHTML = '';

    draw(data);

}

/***
 * Delete given network
 * @param network_name: network name to delete
 * @returns {boolean}: True if the deletion succeed. False otherwise.
 */
function delete_network(network_name) {
    if (confirm("Are you sure?")) {
        delete networks_dict[network_name];
        document.getElementById(network_name).remove();

        destroy();

        if (Object.keys(networks_dict).length === 0) {
            current_network_name = null;
            $("#network_name").text(null);
            $(".has_network").hide();
            //clear card
            removeAllChilds('eventSpan');
            document.getElementById('eventSpan').innerHTML = '';
        } else {
            current_network_name = Object.keys(networks_dict)[0];
            loadNetwork(current_network_name, "0");
        }

        return true;
    }
    return false;
}

/**
 * Add new network, to the glbal network_dict variable.
 * @param network_name - network's name
 * @param nodes_list - network's nodes
 * @param edges_list - network's edges.
 * @returns {boolean} - True if the addition succeed, False otherwise.
 */
function add_network(network_name, nodes_list = [], edges_list = []) {
    if (networks_dict[network_name] !== undefined)
        return false;

    networks_dict[network_name] = new NetworkClass(nodes_list, edges_list);
    return true;
}
