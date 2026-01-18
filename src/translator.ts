import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { ConfigManager, TranslationConfig } from './config';

const execPromise = promisify(exec);

export interface TranslationResult {
    monoPath?: string;
    dualPath?: string;
    error?: string;
}

export class PDFTranslator {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('PDF Translate');
    }

    /**
     * Check if pdf2zh is installed and available
     */
    private async checkPdf2zhInstalled(pdf2zhPath: string): Promise<boolean> {
        try {
            const { stdout } = await execPromise(`"${pdf2zhPath}" --version`);
            this.outputChannel.appendLine(`pdf2zh found: ${stdout.trim()}`);
            return true;
        } catch (error) {
            this.outputChannel.appendLine(`pdf2zh not found at: ${pdf2zhPath}`);
            return false;
        }
    }

    /**
     * Translate a PDF file
     */
    async translatePDF(pdfPath: string, configOverride?: Partial<TranslationConfig>): Promise<TranslationResult> {
        const config = { ...ConfigManager.getConfig(), ...configOverride };

        // Check if pdf2zh is installed
        const isInstalled = await this.checkPdf2zhInstalled(config.pdf2zhPath);
        if (!isInstalled) {
            const choice = await vscode.window.showErrorMessage(
                'pdf2zh is not installed or not found in PATH. Would you like to see installation instructions?',
                'Show Instructions',
                'Cancel'
            );

            if (choice === 'Show Instructions') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/Byaidu/PDFMathTranslate#installation'));
            }

            return { error: 'pdf2zh not installed' };
        }

        // Get output directory
        const outputDir = this.getOutputDirectory(pdfPath, config.outputDirectory);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Build and execute command
        const command = this.buildCommand(pdfPath, outputDir, config);
        this.outputChannel.appendLine(`Output directory: ${outputDir}`);
        this.outputChannel.appendLine(`Executing: ${command}`);

        return this.executeTranslation(command, pdfPath, outputDir, config);
    }

    /**
     * Execute the translation command
     */
    private executeTranslation(
        command: string,
        pdfPath: string,
        outputDir: string,
        config: TranslationConfig
    ): Promise<TranslationResult> {
        return new Promise((resolve) => {
            const envVars = {
                ...process.env,
                ...ConfigManager.getEnvironmentVariables()
            };

            const childProcess = spawn(command, {
                shell: true,
                env: envVars,
                cwd: outputDir
            });

            let stderr = '';

            childProcess.stdout?.on('data', (data: Buffer) => {
                this.outputChannel.append(data.toString());
            });

            childProcess.stderr?.on('data', (data: Buffer) => {
                stderr += data.toString();
                this.outputChannel.append(`[STDERR] ${data.toString()}`);
            });

            childProcess.on('error', (error) => {
                this.outputChannel.appendLine(`[ERROR] ${error.message}`);
                resolve({ error: error.message });
            });

            childProcess.on('close', (code) => {
                this.outputChannel.appendLine(`Process exited with code: ${code}`);

                if (code === 0) {
                    resolve(this.getOutputPaths(pdfPath, outputDir));
                } else {
                    if (stderr) {
                        this.outputChannel.appendLine(`STDERR: ${stderr}`);
                    }
                    resolve({
                        error: `Translation failed with exit code ${code}. Check Output panel for details.`
                    });
                }
            });
        });
    }

    /**
     * Build the pdf2zh command
     */
    private buildCommand(pdfPath: string, outputDir: string, config: TranslationConfig): string {
        const parts = [
            `"${config.pdf2zhPath}"`,
            `"${pdfPath}"`,
            `-o "${outputDir}"`,
            `-li ${config.sourceLanguage}`,
            `-lo ${config.targetLanguage}`,
            `-s ${config.translationService}`
        ];

        if (config.threads > 0) {
            parts.push(`-t ${config.threads}`);
        }

        return parts.join(' ');
    }

    /**
     * Get the output directory for translated PDFs
     */
    private getOutputDirectory(pdfPath: string, customOutputDir: string): string {
        if (customOutputDir) {
            return customOutputDir;
        }

        // Default: create 'translated-pdfs' subfolder in source directory
        const sourceDir = path.dirname(pdfPath);
        return path.join(sourceDir, 'translated-pdfs');
    }

    /**
     * Get the expected output file paths
     */
    private getOutputPaths(pdfPath: string, outputDir: string): TranslationResult {
        const baseName = path.basename(pdfPath, '.pdf');
        return {
            monoPath: path.join(outputDir, `${baseName}-mono.pdf`),
            dualPath: path.join(outputDir, `${baseName}-dual.pdf`)
        };
    }

    /**
     * Show the output channel
     */
    showOutput(): void {
        this.outputChannel.show();
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.outputChannel.dispose();
    }
}
