import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SenseiAISidebarProvider } from './sidebar';


interface SenseiAIConfig {
	projectRoot?: string;
	include?: string[];
	exclude?: string[];
	maxFileSizeKB?: number;
	scanDepth?: 'shallow' | 'deep';
}


function getConfigFilePath(): string {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		throw new Error('No workspace is open.');
	}
	return path.join(workspaceFolders[0].uri.fsPath, '.senseiai.json');
}

function readConfig(): SenseiAIConfig {
	try {
		const configPath = getConfigFilePath();
		if (fs.existsSync(configPath)) {
			const raw = fs.readFileSync(configPath, 'utf-8');
			return JSON.parse(raw);
		}
	} catch (err) {
		console.error('Failed to read config:', err);
	}
	return {};
}

function writeConfig(newValues: Partial<SenseiAIConfig>) {
	try {
		const configPath = getConfigFilePath();
		const existing: SenseiAIConfig = readConfig();
		const merged = { ...existing, ...newValues };
		fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
	} catch (err) {
		vscode.window.showErrorMessage(`Error writing .senseiai.json: ${err}`);
	}
}


export function activate(context: vscode.ExtensionContext) {
	console.log('🎉 sensei-ai is now active');

	const sidebarProvider = new SenseiAISidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('senseiAIView', sidebarProvider)
	);


	// Command: Set Project Root
	const setProjectRoot = vscode.commands.registerCommand('sensei-ai.setProjectRoot', async () => {
		const folder = await vscode.window.showOpenDialog({
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: 'Set as Project Root',
		});

		if (folder && folder.length > 0) {
			const folderPath = folder[0].fsPath;
			writeConfig({ projectRoot: folderPath });
			vscode.window.showInformationMessage(`✅ Project root saved to .senseiai.json: ${folderPath}`);
		}
	});

	// Command: Scan Project
	let scanProject = vscode.commands.registerCommand('sensei-ai.scanProject', async () => {
		const config = readConfig();
		const rootPath = config.projectRoot;

		if (!rootPath) {
			vscode.window.showErrorMessage('❗ Project root not set. Run "SenseiAI: Set Project Root" first.');
			return;
		}

		const includeGlobs: string[] = config.include || ['**/*.cs'];
		const excludeGlobs: string[] = config.exclude || ['node_modules'];
		const maxFileSizeKB: number = config.maxFileSizeKB || 300;

		vscode.window.showInformationMessage(`🔍 Scanning project at ${rootPath} with config...`);

		let allFiles: vscode.Uri[] = [];

		for (const pattern of includeGlobs) {
			const relPattern = new vscode.RelativePattern(rootPath, pattern);
			const found = await vscode.workspace.findFiles(relPattern, `{${excludeGlobs.join(',')}}`);
			allFiles.push(...found);
		}

		const filteredFiles: vscode.Uri[] = [];
		for (const file of allFiles) {
			try {
				const stat = await vscode.workspace.fs.stat(file);
				if (stat.size / 1024 <= maxFileSizeKB) {
					filteredFiles.push(file);
				}
			} catch (err) {
				console.warn(`⚠️ Could not stat file: ${file.fsPath}`, err);
				continue;
			}
		}

		const fileNames = filteredFiles.map(f => vscode.workspace.asRelativePath(f));
		sidebarProvider.updateResults(fileNames);


		vscode.window.showInformationMessage(`📄 ${filteredFiles.length} file(s) ready for analysis after applying filters.`);
	});



	context.subscriptions.push(setProjectRoot, scanProject);
}

export function deactivate() {}
