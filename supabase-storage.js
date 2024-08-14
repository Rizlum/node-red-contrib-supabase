"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const util_1 = require("util");
const supabaseDbNodeInitializer = (RED) => {
    const evaluateNodeProperty = (0, util_1.promisify)(RED.util.evaluateNodeProperty);
    function SupabaseDbNode(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        const node = this;
        const { url, serviceKey } = this.config;
        let supabase;
        (async () => {
            const customOptions = await evaluateNodeProperty(n.customOptions, n.customOptionsType, node, {});
            supabase = (0, supabase_js_1.createClient)(url, serviceKey, customOptions);
        })().catch(error => {
            node.error(error);
        });
        node.on("input", async (msg, send, done) => {
            const action = n.action;
            const bucket = n.bucket;
            const path = await evaluateNodeProperty(n.path, n.pathType, node, msg);
            const content = await evaluateNodeProperty(n.content, n.contentType, node, msg);
            const fileOptions = await evaluateNodeProperty(n.fileOptions, n.fileOptionsType, node, msg);
            let payload;
            switch (action) {
                case "upload":
                    try {
                        const response = await supabase.storage.from(bucket).upload(path, content, fileOptions);
                        ;
                        if (response.data) {
                            msg.payload = response.data;
                            send(msg);
                            done();
                        }
                        else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    }
                    catch (error) {
                        node.error(`error ${error}`);
                        done(error);
                    }
                    break;
                case "download":
                    try {
                        const response = await supabase.storage.from(bucket).download(path, fileOptions);
                        if (response.data) {
                            msg.payload = Buffer.from(await response.data.arrayBuffer());
                            send(msg);
                            done();
                        }
                        else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    }
                    catch (error) {
                        node.error(`error ${error}`);
                        done(error);
                    }
                    break;
                case "remove":
                    try {
                        const response = await supabase.storage.from(bucket).remove(path);
                        if (response.data) {
                            msg.payload = response.data;
                            send(msg);
                            done();
                        }
                        else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    }
                    catch (error) {
                        node.error(`error ${error}`);
                        done(error);
                    }
                    break;
                default:
                    done(new Error(`Action unknown '${action}'`));
                    break;
            }
        });
    }
    RED.nodes.registerType("supabase-storage", SupabaseDbNode);
};
module.exports = supabaseDbNodeInitializer;
