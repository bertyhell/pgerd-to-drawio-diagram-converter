import {
	type Column,
	type DiagramLink,
	type DiagramLinksLayer,
	type DiagramNode,
	type DiagramNodesLayer,
} from './pgerd.types';
import { type XmlElement } from 'jstoxml';
import { type NodeCollection } from 'cytoscape';
import { randomUuid } from './uuid-generator';

function generateTable(table: DiagramNode, layoutedNode: NodeCollection): XmlElement[] {
	return [
		{
			_name: 'mxCell',
			_attrs: {
				id: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
				value: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
				style: 'shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;',
				parent: '1',
				vertex: '1',
			},
			_content: [
				{
					_name: 'mxGeometry',
					_attrs: {
						x: layoutedNode.boundingbox().x1,
						y: layoutedNode.boundingbox().y1,
						width: '250',
						height: table.otherInfo.data.columns.length * 30,
						as: 'geometry',
					},
				},
			],
		},
		...table.otherInfo.data.columns.flatMap((column, columnIndex) =>
			generateRow(column, columnIndex, table)
		),
	];
}

function generateRow(column: Column, columnIndex: number, table: DiagramNode): XmlElement[] {
	const rowId = `${table.otherInfo.data.schema}.${table.otherInfo.data.name}.${column.attnum}`;
	return [
		{
			_name: 'mxCell',
			_attrs: {
				id: rowId,
				value: String(30 * columnIndex),
				style: 'shape=partialRectangle;collapsible=0;dropTarget=0;pointerEvents=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=1;',
				parent: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
				vertex: '1',
			},
			_content: [
				{
					_name: 'mxGeometry',
					_attrs: {
						y: '30',
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
				id: randomUuid(),
				value: column.is_pk ? 'PK' : column.is_fk ? 'FK' : '',
				style: 'shape=partialRectangle;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;',
				parent: rowId,
				vertex: '1',
			},
			_content: [
				{
					_name: 'mxGeometry',
					_attrs: {
						y: '30',
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
				id: randomUuid(),
				value:
					column.name +
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

function generateLink(link: DiagramLink, tableNodes: Record<string, DiagramNode>): XmlElement[] {
	const sourceTable = tableNodes[link.source];
	const targetTable = tableNodes[link.target];
	const sourceAttachmentPoint = sourceTable.ports.find((port) =>
		port.name.startsWith(`coll-port-${link.data.referenced_column_attnum}`)
	);
	const targetAttachmentPoint = targetTable.ports.find((port) =>
		port.name.startsWith(`coll-port-${link.data.local_column_attnum}`)
	);
	if (sourceAttachmentPoint == null || targetAttachmentPoint == null) {
		console.warn(
			`failed to find link between: ${sourceTable.otherInfo.data.schema}.${sourceTable.otherInfo.data.name}.${link.data.referenced_column_attnum} => ${targetTable.otherInfo.data.schema}.${targetTable.otherInfo.data.name}.${link.data.local_column_attnum}`
		);
		return []; // TODO figure out why these can't be found
	}
	return [
		{
			_name: 'mxCell',
			_attrs: {
				id: randomUuid(),
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
								x: sourceAttachmentPoint?.x,
								y: sourceAttachmentPoint?.y,
								as: 'sourcePoint',
							},
						},
						{
							_name: 'mxPoint',
							_attrs: {
								x: targetAttachmentPoint?.x,
								y: targetAttachmentPoint?.y,
								as: 'targetPoint',
							},
						},
					],
				},
			],
		},
	];
}

export function generateDrawIoDiagramXml(
	diagramNodesLayer: DiagramNodesLayer,
	diagramLinksLayer: DiagramLinksLayer | undefined,
	layoutedGraph: cytoscape.Core
): XmlElement {
	const tableDiagrams = Object.values(diagramNodesLayer.models);
	const tables = tableDiagrams.flatMap((table): XmlElement[] => {
		return generateTable(
			table,
			layoutedGraph.nodes('#' + table.otherInfo.data.schema + '.' + table.otherInfo.data.name)
		);
	});

	let links: XmlElement[] = [];
	if (diagramLinksLayer !== undefined) {
		links = Object.values(diagramLinksLayer?.models ?? {}).flatMap((link) => {
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
					extFonts:
						'Permanent Marker^https://fonts.googleapis.com/css?family=Permanent+Marker',
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
