import { type DiagramLink, type DiagramNode } from './pgerd.types';
import cytoscape, { type ElementDefinition } from 'cytoscape';

// @ts-expect-error no typings exist
import coseBilkent from 'cytoscape-cose-bilkent';

// @ts-expect-error no typings exist
import cola from 'cytoscape-cola';

// @ts-expect-error no typings exist
import dagre from 'cytoscape-dagre';
import { randomUuid } from './uuid-generator';

cytoscape.use(cola);
cytoscape.use(coseBilkent);
cytoscape.use(dagre);

function mapTableToNode(table: DiagramNode): ElementDefinition {
	return {
		data: {
			id: table.otherInfo.data.schema + '.' + table.otherInfo.data.name,
			width: 300,
			height: table.otherInfo.data.columns.length * 30 + 45,
		},
	};
}

function mapLinkToEdge(link: DiagramLink, tableNodes: DiagramNode[]): ElementDefinition | null {
	const sourceTable = tableNodes.find((table) => table.id === link.source);
	const targetTable = tableNodes.find((table) => table.id === link.target);
	if (sourceTable !== undefined && targetTable !== undefined) {
		return {
			data: {
				id: randomUuid(),
				source: sourceTable.otherInfo.data.schema + '.' + sourceTable.otherInfo.data.name,
				target: targetTable.otherInfo.data.schema + '.' + targetTable.otherInfo.data.name,
			},
		};
	} else {
		console.error('Failed to find some tables for link: ', link);
		return null;
	}
}

export function getGraphLayout(
	diagramNodes: DiagramNode[],
	diagramLinks: DiagramLink[]
): cytoscape.Core {
	const tableNodes: ElementDefinition[] = diagramNodes.map(mapTableToNode);
	const linkEdges: ElementDefinition[] = diagramLinks
		.map((link) => mapLinkToEdge(link, diagramNodes))
		.filter((edge: ElementDefinition | null) => edge !== null) as ElementDefinition[];

	// Create a new directed graph
	const cy = cytoscape({
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
	} as any).run();

	return cy;
}
