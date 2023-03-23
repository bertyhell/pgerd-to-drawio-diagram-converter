import {
	type DiagramLinksLayer,
	type DiagramNodesLayer,
	type PgErdDiagramInfo,
} from './pgerd.types';
import { toXML, type XmlElement } from 'jstoxml';
import { generateDrawIoDiagramXml } from './xml-generation';
import { getGraphLayout } from './layout-graph';

export function convertPgerdToDrawIo(pgDiagram: PgErdDiagramInfo): string {
	const diagramNodesLayer: DiagramNodesLayer | undefined = pgDiagram.data.layers.find(
		(layer) => layer.type === 'diagram-nodes'
	) as DiagramNodesLayer | undefined;

	const diagramLinksLayer: DiagramLinksLayer | undefined = pgDiagram.data.layers.find(
		(layer) => layer.type === 'diagram-links'
	) as DiagramLinksLayer | undefined;

	if (diagramNodesLayer === undefined) {
		throw new Error('No diagram nodes found');
	} else {
		const layoutedGraph = getGraphLayout(
			Object.values(diagramNodesLayer.models),
			Object.values(diagramLinksLayer?.models ?? {})
		);

		const diagramXml: XmlElement = generateDrawIoDiagramXml(
			diagramNodesLayer,
			diagramLinksLayer,
			layoutedGraph
		);

		return '<?xml version="1.0" encoding="UTF-8"?>' + toXML(diagramXml, { indent: '    ' });
	}
}
