import * as vscode from 'vscode';
import * as path from 'path';
import { PDFTranslator } from './translator';
import { ConfigManager } from './config';

let translator: PDFTranslator;

export function activate(context: vscode.ExtensionContext) {
    console.log('PDF Translate extension is now active');

    translator = new PDFTranslator();

    // Register translate command
    context.subscriptions.push(
        vscode.commands.registerCommand('pdfTranslate.translate', async (uri?: vscode.Uri) => {
            await translateCommand(uri);
        })
    );

    // Register language selection command
    context.subscriptions.push(
        vscode.commands.registerCommand('pdfTranslate.selectLanguages', async () => {
            const result = await ConfigManager.selectLanguages();
            if (result) {
                vscode.window.showInformationMessage(
                    `Language pair updated: ${result.source} → ${result.target}`
                );
            }
        })
    );

    context.subscriptions.push(translator);
}

async function translateCommand(uri: vscode.Uri | undefined): Promise<void> {
    // Get PDF file path
    const pdfPath = await getPDFPath(uri);
    if (!pdfPath) {
        return;
    }

    // Get configuration
    const config = ConfigManager.getConfig();
    const fileName = path.basename(pdfPath);

    // Confirm translation
    const message = `Translate "${fileName}" from ${config.sourceLanguage} to ${config.targetLanguage}?`;
    const choice = await vscode.window.showInformationMessage(
        message,
        'Translate',
        'Change Languages',
        'Cancel'
    );

    if (!choice || choice === 'Cancel') {
        return;
    }

    if (choice === 'Change Languages') {
        const langResult = await ConfigManager.selectLanguages();
        if (langResult) {
            // Recursively call with new languages
            return translateCommand(uri);
        }
        return;
    }

    try {
        // Translate PDF (progress bar will be shown automatically)
        const result = await translator.translatePDF(pdfPath);

        if (result.error) {
            // Handle user cancellation separately
            if (result.error === 'Translation cancelled by user') {
                vscode.window.showInformationMessage('Translation cancelled');
                return;
            }
            vscode.window.showErrorMessage(`Translation failed: ${result.error}`);
            translator.showOutput();
            return;
        }

        // Show success message with file location
        if (result.monoPath) {
            const outputDir = path.dirname(result.monoPath);
            const relativePath = path.relative(path.dirname(pdfPath), outputDir);
            const fullPath = path.join(relativePath, path.basename(result.monoPath));

            vscode.window.showInformationMessage(
                `Translation completed! File saved to: ${fullPath}`
            );

            // Open mono PDF in sidebar
            await vscode.commands.executeCommand(
                'vscode.open',
                vscode.Uri.file(result.monoPath),
                vscode.ViewColumn.Beside
            );
        } else {
            vscode.window.showWarningMessage('Translation completed but output file not found');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Translation error: ${errorMessage}`);
        translator.showOutput();
    }
}

async function getPDFPath(uri?: vscode.Uri): Promise<string | undefined> {
    // If URI is provided and is a PDF, use it
    if (uri?.fsPath.endsWith('.pdf')) {
        return uri.fsPath;
    }

    // Show file picker
    const fileUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { 'PDF Files': ['pdf'] },
        title: 'Select PDF to Translate'
    });

    return fileUris?.[0]?.fsPath;
}

export function deactivate() {
    translator?.dispose();
}
