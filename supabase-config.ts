import { NodeAPI, Node, NodeDef, NodeInitializer } from "node-red";

export interface SupabaseConfigNodeDef extends NodeDef {
    name: string;
    url: string;
    serviceKey: string;
}

const supabaseConfigInitializer: NodeInitializer = function (RED) {
    function SupabaseConfigNode(this: Node & SupabaseConfigNodeDef, n: SupabaseConfigNodeDef) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.url = n.url;
        this.serviceKey = n.serviceKey;
    }

    RED.nodes.registerType("supabase-config", SupabaseConfigNode);
};

module.exports = supabaseConfigInitializer;