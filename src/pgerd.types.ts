export interface PgErdDiagramInfo {
	version: string
	data: Data
}

export interface Data {
	id: string
	offsetX: number
	offsetY: number
	zoom: number
	gridSize: number
	layers: (DiagramLinksLayer | DiagramNodesLayer)[]
}

export interface DiagramLinksLayer {
	id: string
	type: 'diagram-links'
	isSvg: boolean
	transformed: boolean
	models: Record<string, DiagramLink>;
}

export interface DiagramNodesLayer {
	id: string
	type: 'diagram-nodes'
	isSvg: boolean
	transformed: boolean
	models: Record<string, DiagramNode>;
}

export interface DiagramLink {
	id: string
	locked: boolean
	type: string
	selected?: boolean
	source: string
	sourcePort: string
	target: string
	targetPort: string
	points: Point[]
	labels: any[]
	width: number
	color: string
	curvyness: number
	selectedColor: string
	data: ModelData
}

export interface Point {
	id: string
	type: string
	x: number
	y: number
}

export interface ModelData {
	local_table_uid: string
	local_column_attnum: number
	referenced_table_uid: string
	referenced_column_attnum: number
}

export interface DiagramNode {
	id: string
	type: 'table'
	selected?: boolean
	x: number
	y: number
	ports: Port[]
	name: string
	color: string
	portsInOrder: any[]
	portsOutOrder: any[]
	otherInfo: DiagramNodeOtherInfo
}

export interface Port {
	id: string
	type: string
	x: number
	y: number
	name: string
	alignment: string
	parentNode: string
	links: string[]
}

export interface DiagramNodeOtherInfo {
	data: DiagramNodeOtherInfoData
	note: string
	metadata: Metadata
}

export interface DiagramNodeOtherInfoData {
	columns: Column[]
	name: string
	schema: string
	description: string | null
	rlspolicy: boolean
	forcerlspolicy: boolean
	fillfactor: any
	toast_tuple_target: any
	parallel_workers: any
	relpersistence: boolean
	primary_key: PrimaryKey[]
	foreign_key: ForeignKey[]
	unique_constraint: any[]
}

export interface Column {
	name: string
	atttypid: number
	attlen: any
	attnum: number
	attndims: number
	atttypmod: number
	attacl: any[]
	attnotnull: boolean
	attoptions: any
	attstattarget: number
	attstorage: string
	attidentity: string
	defval?: string | number | null
	typname: string
	displaytypname: string
	cltype: string
	elemoid: number
	typnspname: string
	defaultstorage: string
	description: any
	indkey: string | null
	isdup: boolean
	collspcname: string
	is_fk: boolean
	seclabels: any
	is_sys_column: boolean
	colconstype: string
	genexpr: any
	relname: string
	is_view_only: boolean
	seqrelid: any
	seqtypid: any
	seqstart: any
	seqincrement: any
	seqmax: any
	seqmin: any
	seqcache: any
	seqcycle: any
	is_pk: boolean
	is_primary_key: boolean
	attprecision: any
	edit_types: string[]
}

export interface PrimaryKey {
	oid: number
	name: string
	col_count: number
	spcname: string
	comment: any
	condeferrable: boolean
	condeferred: boolean
	conislocal: boolean
	fillfactor: any
	columns: PrimaryKeyColumn[]
	include: any[]
}

export interface PrimaryKeyColumn {
	column: string
}

export interface Metadata {
	data_failed: boolean
	is_promise: boolean
}

export interface Port {
	id: string
	type: string
	x: number
	y: number
	name: string
	alignment: string
	parentNode: string
	links: string[]
}

export interface ForeignKey {
	name: string
	condeferrable: boolean
	condeferred: boolean
	confupdtype: string
	confdeltype: string
	confmatchtype: boolean
	conkey: number[]
	confkey: number[]
	confrelid: number
	fknsp: string
	fktab: string
	refnspoid: number
	refnsp: string
	reftab: string
	comment: any
	convalidated: boolean
	conislocal: boolean
	columns: ForeignKeyColumn[]
	remote_schema: string
	remote_table: string
	coveringindex: any
	autoindex: boolean
	hasindex: boolean
}

export interface ForeignKeyColumn {
	local_column: string
	references: string
	referenced: string
	references_table_name: string
}
