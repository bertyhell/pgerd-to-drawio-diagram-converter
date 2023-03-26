"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDrawIoDiagramXml = void 0;
const uuid_generator_1 = require("./uuid-generator");
function generateTable(table, layoutedNode) {
    return [
        {
            _name: 'mxCell',
            _attrs: {
                id: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
                value: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
                style: 'shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;rounded=1;swimlaneLine=1;bottom=1;',
                parent: '1',
                vertex: '1',
            },
            _content: [
                {
                    _name: 'mxGeometry',
                    _attrs: {
                        x: layoutedNode.boundingbox().x1,
                        y: layoutedNode.boundingbox().y1,
                        width: '300',
                        height: table.otherInfo.data.columns.length * 30 + 45,
                        as: 'geometry',
                    },
                },
            ],
        },
        ...table.otherInfo.data.columns.flatMap((column, columnIndex) => generateRow(column, columnIndex, table)),
    ];
}
function generateRow(column, columnIndex, table) {
    const rowId = `${table.otherInfo.data.schema}.${table.otherInfo.data.name}.${column.attnum}`;
    return [
        {
            _name: 'mxCell',
            _attrs: {
                id: rowId,
                value: '',
                style: 'shape=partialRectangle;collapsible=0;dropTarget=0;pointerEvents=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=1;',
                parent: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
                vertex: '1',
            },
            _content: [
                {
                    _name: 'mxGeometry',
                    _attrs: {
                        y: String(30 * columnIndex),
                        width: '250',
                        height: '30',
                        as: 'geometry',
                    },
                },
            ],
        },
        {
            _name: 'mxCell',
            _attrs: {
                id: (0, uuid_generator_1.randomUuid)(),
                value: column.is_pk ? 'PK' : column.is_fk ? 'FK' : '',
                style: 'shape=partialRectangle;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;',
                parent: rowId,
                vertex: '1',
            },
            _content: [
                {
                    _name: 'mxGeometry',
                    _attrs: {
                        width: '30',
                        height: '30',
                        as: 'geometry',
                    },
                },
            ],
        },
        {
            _name: 'mxCell',
            _attrs: {
                id: (0, uuid_generator_1.randomUuid)(),
                value: column.name +
                    ' ' +
                    column.typname +
                    ' ' +
                    (column.attnotnull ? 'NOT NULL' : ''),
                style: 'shape=partialRectangle;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;fontStyle=5;',
                parent: rowId,
                vertex: '1',
            },
            _content: [
                {
                    _name: 'mxGeometry',
                    _attrs: {
                        x: '30',
                        width: '220',
                        height: '30',
                        as: 'geometry',
                    },
                },
            ],
        },
    ];
}
function generateLink(link, tableNodes) {
    const sourceTable = tableNodes[link.source];
    const targetTable = tableNodes[link.target];
    const sourceAttachmentPoint = sourceTable.ports.find((port) => port.name.startsWith(`coll-port-${link.data.referenced_column_attnum}`));
    const targetAttachmentPoint = targetTable.ports.find((port) => port.name.startsWith(`coll-port-${link.data.local_column_attnum}`));
    if (sourceAttachmentPoint == null || targetAttachmentPoint == null) {
        console.warn(`failed to find link between: ${sourceTable.otherInfo.data.schema}.${sourceTable.otherInfo.data.name}.${link.data.referenced_column_attnum} => ${targetTable.otherInfo.data.schema}.${targetTable.otherInfo.data.name}.${link.data.local_column_attnum}`);
        return []; // TODO figure out why these can't be found
    }
    return [
        {
            _name: 'mxCell',
            _attrs: {
                id: (0, uuid_generator_1.randomUuid)(),
                value: '',
                style: 'edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERone;endFill=1;startFill=0;',
                parent: '1',
                source: `${sourceTable.otherInfo.data.schema}.${sourceTable.otherInfo.data.name}.${link.data.referenced_column_attnum}`,
                target: `${targetTable.otherInfo.data.schema}.${targetTable.otherInfo.data.name}.${link.data.local_column_attnum}`,
                edge: '1',
            },
            _content: [
                {
                    _name: 'mxGeometry',
                    _attrs: {
                        width: '100',
                        height: '100',
                        relative: '1',
                        as: 'geometry',
                    },
                    _content: [
                        {
                            _name: 'mxPoint',
                            _attrs: {
                                x: sourceAttachmentPoint === null || sourceAttachmentPoint === void 0 ? void 0 : sourceAttachmentPoint.x,
                                y: sourceAttachmentPoint === null || sourceAttachmentPoint === void 0 ? void 0 : sourceAttachmentPoint.y,
                                as: 'sourcePoint',
                            },
                        },
                        {
                            _name: 'mxPoint',
                            _attrs: {
                                x: targetAttachmentPoint === null || targetAttachmentPoint === void 0 ? void 0 : targetAttachmentPoint.x,
                                y: targetAttachmentPoint === null || targetAttachmentPoint === void 0 ? void 0 : targetAttachmentPoint.y,
                                as: 'targetPoint',
                            },
                        },
                    ],
                },
            ],
        },
    ];
}
function generateDrawIoDiagramXml(diagramNodesLayer, diagramLinksLayer, layoutedGraph) {
    var _a;
    const tableDiagrams = Object.values(diagramNodesLayer.models);
    const tables = tableDiagrams.flatMap((table) => {
        return generateTable(table, layoutedGraph.nodes('#' + table.otherInfo.data.schema + '.' + table.otherInfo.data.name));
    });
    let links = [];
    if (diagramLinksLayer !== undefined) {
        links = Object.values((_a = diagramLinksLayer === null || diagramLinksLayer === void 0 ? void 0 : diagramLinksLayer.models) !== null && _a !== void 0 ? _a : {}).flatMap((link) => {
            return generateLink(link, diagramNodesLayer.models);
        });
    }
    return {
        _name: 'mxfile',
        _attrs: {
            host: 'app.diagrams.net',
            modified: new Date().toISOString(),
            agent: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            etag: 'xz4sYTl0PLk-L4-nLoLk',
            version: '20.8.20',
            type: 'google',
        },
        _content: {
            _name: 'diagram',
            _attrs: {
                id: 'R2lEEEUBdFMjLlhIrx00',
                name: 'Page-1',
            },
            _content: {
                _name: 'mxGraphModel',
                _attrs: {
                    dx: '1357',
                    dy: '858',
                    grid: '1',
                    gridSize: '10',
                    guides: '1',
                    tooltips: '1',
                    connect: '1',
                    arrows: '1',
                    fold: '1',
                    page: '1',
                    pageScale: '1',
                    pageWidth: '850',
                    pageHeight: '1100',
                    math: '0',
                    shadow: '0',
                    extFonts: 'Permanent Marker^https://fonts.googleapis.com/css?family=Permanent+Marker',
                },
                _content: {
                    _name: 'root',
                    _content: [
                        {
                            _name: 'mxCell',
                            _attrs: {
                                id: '0',
                            },
                        },
                        {
                            _name: 'mxCell',
                            _attrs: {
                                id: '1',
                                parent: '0',
                            },
                        },
                        ...tables,
                        ...links,
                    ],
                },
            },
        },
    };
}
exports.generateDrawIoDiagramXml = generateDrawIoDiagramXml;
