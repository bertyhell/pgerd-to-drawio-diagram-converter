import { type DiagramLink, type DiagramNode } from './pgerd.types';
import cytoscape from 'cytoscape';
export declare function getGraphLayout(diagramNodes: DiagramNode[], diagramLinks: DiagramLink[]): cytoscape.Core;
