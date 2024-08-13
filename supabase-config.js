"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseConfigInitializer = function (RED) {
    function SupabaseConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.url = n.url;
        this.serviceKey = n.serviceKey;
    }
    RED.nodes.registerType("supabase-config", SupabaseConfigNode);
};
module.exports = supabaseConfigInitializer;
