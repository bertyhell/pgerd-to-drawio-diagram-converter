import './App.css';
import React, { type ReactElement, useState } from 'react';
import { saveAs } from 'file-saver';
import { type PgErdDiagramInfo } from '../../src/pgerd.types';
import { convertPgerdToDrawIo } from '../../src/converter';

function App(): ReactElement {
	const [file, setFile] = useState<File | null>(null);

	const convertDiagram = (evt: ProgressEvent<FileReader>): void => {
		const content: string = evt.target?.result as string;
		const pgerdDiagramJson: PgErdDiagramInfo = JSON.parse(content);
		const drawIoXml = convertPgerdToDrawIo(pgerdDiagramJson);

		const blob = new Blob([drawIoXml], { type: 'text/xml;charset=utf-8' });
		saveAs(blob, 'diagram.drawio.xml');
	};

	const handleConvertButtonClicked = (): void => {
		if (file === null) {
			window.alert('No file was selected');
			return;
		}

		const fileReader = new FileReader();
		fileReader.onloadend = convertDiagram;
		fileReader.readAsText(file);
	};

	return (
		<div className="App">
			<h1>Select the .pgerd file to convert</h1>
			<input
				type="file"
				accept={'.pgerd, .json'}
				onChange={(evt) => {
					setFile(evt.target.files?.[0] ?? null);
				}}
			/>
			<button onClick={handleConvertButtonClicked}>Convert</button>
		</div>
	);
}

export default App;
