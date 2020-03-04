class SideNaviBar {
    constructor(container_id, items_div_id, items_labels) {
        this.items_labels = items_labels;
        this.container = container_id;
        this.items_div_id = items_div_id;

        //Add the items
        for (const key in items_labels) {
            // Container <div> where dynamic content will be placed
            if (items_labels.hasOwnProperty(key)) {

                // Create an <input> element, set its type and name attributes
                const node = document.createElement("a");
                const text_node = document.createTextNode(key);

                node.appendChild(text_node);
                node.href = "#";
                node.id = key;
                node.onclick = function () {
                    loadNetwork(this.id, "0");
                };

                document.getElementById(this.items_div_id).appendChild(node);
            }
        }
    };

    deleteElement(label) {
        document.getElementById(label).delete();
    }

    addElement(label) {
        // Create an <input> element, set its type and name attributes
        var node = document.createElement("a");
        var text_node = document.createTextNode(label);
        node.href = "#";

        node.id = label;
        node.onclick = function () {
            loadNetwork(this.id, "0");
        };
        node.appendChild(text_node);
        document.getElementById(this.items_div_id).appendChild(node);

    }

    openNav() {
        document.getElementById(this.container).style.width = "200px";
        document.getElementById("main").style.marginLeft = "200px";
    }

    closeNav() {
        document.getElementById(this.container).style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }

}

