import { Node, NodeDef, NodeInitializer, NodeMessage } from "node-red";
import { SupabaseConfigNodeDef } from "./supabase-config";

import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { promisify } from 'util';

export interface SupabaseDbNodeDef extends NodeDef {
    name: string;
    config: SupabaseConfigNodeDef,
    table: string;
    action: 'upload' | 'download' | 'remove';
    bucket: string;
    bucketType: string;
    path: any;
    pathType: string;
    content: any;
    contentType: string;
    fileOptions: any;
    fileOptionsType: string;
    customOptions: any;
    customOptionsType: string;
}

const supabaseDbNodeInitializer: NodeInitializer = (RED) => {
    const evaluateNodeProperty = promisify(RED.util.evaluateNodeProperty);

    function SupabaseDbNode(this: Node & Pick<SupabaseDbNodeDef, 'config'>, n: SupabaseDbNodeDef) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config as any) as any;

        const node = this;
        const { url, serviceKey } = this.config;

        let supabase: SupabaseClient;
        (async () => {
            const customOptions = await evaluateNodeProperty(n.customOptions, n.customOptionsType, node, {});
            supabase = createClient(url, serviceKey, customOptions);
        })().catch(error => {
            node.error(error)
        });

        node.on("input", async (msg: NodeMessage, send: any, done: any) => {
            const action = n.action;
            const bucket = n.bucket;

            const path = await evaluateNodeProperty(n.path, n.pathType, node, msg);
            const content = await evaluateNodeProperty(n.content, n.contentType, node, msg);
            const fileOptions = await evaluateNodeProperty(n.fileOptions, n.fileOptionsType, node, msg);

            let payload: any;
            switch (action) {
                case "upload":
                    try {
                        const response = await supabase.storage.from(bucket).upload(path, content, fileOptions);;
                        if (response.data) {
                            msg.payload = response.data;
                            send(msg);
                            done();
                        } else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    } catch (error) {
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
                        } else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    } catch (error) {
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
                        } else {
                            node.error(`error ${response.error}`);
                            done(response.error);
                        }
                    } catch (error) {
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