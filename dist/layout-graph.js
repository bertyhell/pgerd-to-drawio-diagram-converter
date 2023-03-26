"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphLayout = void 0;
const cytoscape_1 = __importDefault(require("cytoscape"));
// @ts-expect-error no typings exist
const cytoscape_cose_bilkent_1 = __importDefault(require("cytoscape-cose-bilkent"));
// @ts-expect-error no typings exist
const cytoscape_cola_1 = __importDefault(require("cytoscape-cola"));
// @ts-expect-error no typings exist
const cytoscape_dagre_1 = __importDefault(require("cytoscape-dagre"));
const uuid_generator_1 = require("./uuid-generator");
cytoscape_1.default.use(cytoscape_cola_1.default);
cytoscape_1.default.use(cytoscape_cose_bilkent_1.default);
cytoscape_1.default.use(cytoscape_dagre_1.default);
function mapTableToNode(table) {
    return {
        data: {
            id: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
            width: 300,
            height: table.otherInfo.data.columns.length * 30 + 45,
        },
    };
}
function mapLinkToEdge(link, tableNodes) {
    const sourceTable = tableNodes.find((table) => table.id === link.source);
    const targetTable = tableNodes.find((table) => table.id === link.target);
    if (sourceTable !== undefined && targetTable !== undefined) {
        return {
            data: {
                id: (0, uuid_generator_1.randomUuid)(),
                source: sourceTable.otherInfo.data.schema + '.' + sourceTable.otherInfo.data.name,
                target: targetTable.otherInfo.data.schema + '.' + targetTable.otherInfo.data.name,
            },
        };
    }
    else {
        console.error('Failed to find some tables for link: ', link);
        return null;
    }
}
function getGraphLayout(diagramNodes, diagramLinks) {
    const tableNodes = diagramNodes.map(mapTableToNode);
    const linkEdges = diagramLinks
        .map((link) => mapLinkToEdge(link, diagramNodes))
        .filter((edge) => edge !== null);
    // Create a new directed graph
    const cy = (0, cytoscape_1.default)({
        headless: true,
        styleEnabled: true,
        elements: [...tableNodes, ...linkEdges],
        style: [
            {
                selector: 'node',
                style: {
                    width: 'data(width)',
                    height: 'data(height)',
                },
            },
            {
                selector: 'edge',
                style: {
                    width: 3,
                },
            },
        ],
    });
    // run layout algorithm
    cy.layout({
        name: 'cose-bilkent',
        boundingBox: {
            x1: 0,
            y1: 0,
            w: 5000,
            h: 4000,
        },
        avoidOverlap: true,
        quality: 'draft',
        fit: true,
        padding: 40,
        nodeRepulsion: 4500,
        idealEdgeLength: 250,
        numIter: 1000,
        animate: false,
    }).run();
    return cy;
}
exports.getGraphLayout = getGraphLayout;
