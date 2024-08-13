"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const supabaseDbNodeInitializer = (RED) => {
    const evaluateNodeProperty = (0, util_1.promisify)(RED.util.evaluateNodeProperty);
    function SupabaseDbNode(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        const node = this;
        node.on("input", async (msg, send, done) => {
            const { url, serviceKey } = this.config;
            const table = n.table;
            const action = n.action;
            const customHeaders = await evaluateNodeProperty(n.customHeaders, n.customHeadersType, node, msg);
            let query;
            let body;
            let fetchUrl = `${url}/rest/v1/${table}`; // FIXME(QL): Injection?
            const headers = {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
                ...customHeaders
            };
            let req;
            switch (action) {
                case "create":
                    body = await evaluateNodeProperty(n.body, n.bodyType, node, msg);
                    req = fetch(fetchUrl, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(body)
                    });
                    break;
                case "read":
                    query = await evaluateNodeProperty(n.query, n.queryType, node, msg);
                    fetchUrl = `${url}/rest/v1/${table}?${query}`;
                    req = fetch(fetchUrl, {
                        method: "GET",
                        headers,
                    });
                    break;
                case "update":
                    query = await evaluateNodeProperty(n.query, n.queryType, node, msg);
                    body = await evaluateNodeProperty(n.body, n.bodyType, node, msg);
                    fetchUrl = `${url}/rest/v1/${table}?${query}`;
                    req = fetch(fetchUrl, {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify(body)
                    });
                    break;
                case "delete":
                    query = await evaluateNodeProperty(n.query, n.queryType, node, msg);
                    fetchUrl = `${url}/rest/v1/${table}?${query}`;
                    req = fetch(fetchUrl, {
                        method: "DELETE",
                        headers,
                    });
                    break;
            }
            node.log(`fetchUrl ${fetchUrl}`);
            node.log(`table ${table}`);
            node.log(`action ${action}`);
            node.log(`(evaluated) query '${query}' (raw) query '${n.query}' type '${n.queryType}'`);
            node.log(`(evaluated) body '${body}' (raw) body '${n.body}' type '${n.bodyType}'`);
            try {
                const response = await req;
                const text = await response.text();
                try {
                    msg.payload = {
                        status: response.status,
                        json: JSON.parse(text)
                    };
                }
                catch (e) {
                    msg.payload = {
                        status: response.status,
                        text
                    };
                }
                send(msg);
                done();
            }
            catch (error) {
                node.error(`error ${error}`);
                done(error);
            }
        });
    }
    RED.nodes.registerType("supabase-db", SupabaseDbNode);
};
module.exports = supabaseDbNodeInitializer;
