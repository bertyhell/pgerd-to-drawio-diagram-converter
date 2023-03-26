/// <reference types="cytoscape" />
import { type DiagramLinksLayer, type DiagramNodesLayer } from './pgerd.types';
import { type XmlElement } from 'jstoxml';
export declare function generateDrawIoDiagramXml(diagramNodesLayer: DiagramNodesLayer, diagramLinksLayer: DiagramLinksLayer | undefined, layoutedGraph: cytoscape.Core): XmlElement;
