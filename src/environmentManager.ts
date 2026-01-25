import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Strip ANSI escape codes from string
 */
function stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

export interface EnvironmentStatus {
    uvInstalled: boolean;
    pdf2zhInstalled: boolean;
    pdf2zhPath: string | null;
    ready: boolean;
}

export class EnvironmentManager {
    private outputChannel: vscode.OutputChannel;
    private isInitializing: boolean = false;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Get the default uv binary path
     */
    private getUvPath(): string {
        const homeDir = os.homedir();
        if (process.platform === 'win32') {
            return path.join(homeDir, '.local', 'bin', 'uv.exe');
        }
        // Also check cargo bin for uv
        return path.join(homeDir, '.local', 'bin', 'uv');
    }

    /**
     * Get the default pdf2zh path (installed via uv tool)
     */
    private getPdf2zhPath(): string {
        const homeDir = os.homedir();
        if (process.platform === 'win32') {
            return path.join(homeDir, '.local', 'bin', 'pdf2zh.exe');
        }
        return path.join(homeDir, '.local', 'bin', 'pdf2zh');
    }

    /**
     * Check if uv is installed
     */
    async checkUvInstalled(): Promise<boolean> {
        try {
            // Try default path first
            const uvPath = this.getUvPath();
            if (fs.existsSync(uvPath)) {
                await execPromise(`"${uvPath}" --version`);
                return true;
            }
            // Try system PATH
            await execPromise('uv --version');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if pdf2zh is installed
     */
    async checkPdf2zhInstalled(): Promise<string | null> {
        const possiblePaths = [
            this.getPdf2zhPath(),
            'pdf2zh' // System PATH
        ];

        for (const pdf2zhPath of possiblePaths) {
            try {
                const { stdout } = await execPromise(`"${pdf2zhPath}" --version`);
                this.outputChannel.appendLine(`pdf2zh found at: ${pdf2zhPath} (${stdout.trim()})`);
                return pdf2zhPath === 'pdf2zh' ? pdf2zhPath : pdf2zhPath;
            } catch {
                // Continue to next path
            }
        }
        return null;
    }

    /**
     * Get the current environment status
     */
    async getStatus(): Promise<EnvironmentStatus> {
        const uvInstalled = await this.checkUvInstalled();
        const pdf2zhPath = await this.checkPdf2zhInstalled();

        return {
            uvInstalled,
            pdf2zhInstalled: pdf2zhPath !== null,
            pdf2zhPath,
            ready: pdf2zhPath !== null
        };
    }

    /**
     * Install uv using the official installer
     */
    private async installUv(
        progress: vscode.Progress<{ message?: string }>,
        token: vscode.CancellationToken
    ): Promise<boolean> {
        return new Promise((resolve) => {
            progress.report({ message: 'Installing uv package manager...' });
            this.outputChannel.appendLine('[ENV] Installing uv...');

            let command: string;
            let args: string[];
            let shell: string | boolean;

            if (process.platform === 'win32') {
                // Windows: use PowerShell
                command = 'powershell';
                args = ['-ExecutionPolicy', 'ByPass', '-c', "irm https://astral.sh/uv/install.ps1 | iex"];
                shell = false;
            } else {
                // Unix: use curl
                command = 'sh';
                args = ['-c', 'curl -LsSf https://astral.sh/uv/install.sh | sh'];
                shell = false;
            }

            const childProcess = spawn(command, args, {
                shell,
                env: { ...process.env }
            });

            let isCancelled = false;

            token.onCancellationRequested(() => {
                isCancelled = true;
                childProcess.kill('SIGTERM');
            });

            childProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString().trim();
                if (output) {
                    this.outputChannel.appendLine(output);
                    // Extract meaningful progress info
                    const lines = output.split('\n');
                    const lastLine = stripAnsi(lines[lines.length - 1] || '').trim();
                    if (lastLine) {
                        progress.report({ message: `Installing uv: ${lastLine.substring(0, 60)}` });
                    }
                }
            });

            childProcess.stderr?.on('data', (data: Buffer) => {
                const output = data.toString().trim();
                if (output) {
                    this.outputChannel.appendLine(`[STDERR] ${output}`);
                    const cleanOutput = stripAnsi(output).trim();
                    progress.report({ message: `Installing uv: ${cleanOutput.substring(0, 60)}` });
                }
            });

            childProcess.on('error', (error) => {
                this.outputChannel.appendLine(`[ERROR] uv installation failed: ${error.message}`);
                resolve(false);
            });

            childProcess.on('close', async (code) => {
                if (isCancelled) {
                    this.outputChannel.appendLine('[INFO] uv installation cancelled');
                    resolve(false);
                    return;
                }

                if (code === 0) {
                    this.outputChannel.appendLine('[INFO] uv installed successfully');
                    resolve(true);
                } else {
                    this.outputChannel.appendLine(`[ERROR] uv installation failed with code ${code}`);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Install pdf2zh using uv tool install
     */
    private async installPdf2zh(
        progress: vscode.Progress<{ message?: string }>,
        token: vscode.CancellationToken
    ): Promise<boolean> {
        return new Promise(async (resolve) => {
            progress.report({ message: 'Installing pdf2zh (this may take a few minutes)...' });
            this.outputChannel.appendLine('[ENV] Installing pdf2zh via uv...');

            const homeDir = os.homedir();
            const binPath = path.join(homeDir, '.local', 'bin');
            const envFile = path.join(homeDir, '.local', 'bin', 'env');

            let command: string;

            if (process.platform === 'win32') {
                // Windows: use uv directly (no env file needed)
                const uvPath = this.getUvPath();
                const uvCommand = fs.existsSync(uvPath) ? `"${uvPath}"` : 'uv';
                command = `${uvCommand} tool install --python 3.12 pdf2zh`;
            } else {
                // macOS/Linux: source the env file first, then run uv
                // This ensures PATH and other environment variables are properly set
                if (fs.existsSync(envFile)) {
                    command = `source "${envFile}" && uv tool install --python 3.12 pdf2zh`;
                } else {
                    // Fallback: use full path to uv
                    const uvPath = this.getUvPath();
                    const uvCommand = fs.existsSync(uvPath) ? `"${uvPath}"` : 'uv';
                    command = `${uvCommand} tool install --python 3.12 pdf2zh`;
                }
            }

            this.outputChannel.appendLine(`[ENV] Executing: ${command}`);

            const childProcess = spawn(command, {
                shell: process.platform === 'win32' ? true : '/bin/bash',
                env: {
                    ...process.env,
                    PATH: `${binPath}${path.delimiter}${process.env.PATH}`
                }
            });

            let isCancelled = false;

            token.onCancellationRequested(() => {
                isCancelled = true;
                if (process.platform === 'win32') {
                    spawn('taskkill', ['/pid', childProcess.pid!.toString(), '/f', '/t'], { shell: true });
                } else {
                    childProcess.kill('SIGTERM');
                }
            });

            childProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString();
                this.outputChannel.append(output);

                // Parse output for meaningful progress messages
                const lines = output.trim().split('\n');
                for (const line of lines) {
                    const cleanLine = stripAnsi(line).trim();
                    if (cleanLine) {
                        // Show download progress, package names, etc.
                        progress.report({ message: cleanLine.substring(0, 80) });
                    }
                }
            });

            childProcess.stderr?.on('data', (data: Buffer) => {
                const output = data.toString();
                this.outputChannel.append(output);

                // Parse stderr for progress info (uv often outputs progress to stderr)
                const lines = output.trim().split('\n');
                for (const line of lines) {
                    const cleanLine = stripAnsi(line).trim();
                    if (cleanLine) {
                        // Common progress patterns: downloading, building, installing
                        progress.report({ message: cleanLine.substring(0, 80) });
                    }
                }
            });

            childProcess.on('error', (error) => {
                this.outputChannel.appendLine(`[ERROR] pdf2zh installation failed: ${error.message}`);
                resolve(false);
            });

            childProcess.on('close', (code) => {
                if (isCancelled) {
                    this.outputChannel.appendLine('[INFO] pdf2zh installation cancelled');
                    resolve(false);
                    return;
                }

                if (code === 0) {
                    this.outputChannel.appendLine('[INFO] pdf2zh installed successfully');
                    resolve(true);
                } else {
                    this.outputChannel.appendLine(`[ERROR] pdf2zh installation failed with code ${code}`);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Initialize the environment (install uv and pdf2zh if needed)
     * Returns the pdf2zh path if successful, null otherwise
     */
    async ensureEnvironment(): Promise<string | null> {
        // Prevent concurrent initialization
        if (this.isInitializing) {
            vscode.window.showWarningMessage('Environment initialization is already in progress');
            return null;
        }

        const status = await this.getStatus();

        // If already ready, return the path
        if (status.ready && status.pdf2zhPath) {
            return status.pdf2zhPath;
        }

        this.isInitializing = true;

        try {
            return await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Initializing PDF Translation Environment',
                    cancellable: true
                },
                async (progress, token) => {
                    // Step 1: Check/Install uv
                    if (!status.uvInstalled) {
                        progress.report({ message: 'Checking uv installation...' });

                        const uvInstalled = await this.installUv(progress, token);
                        if (!uvInstalled) {
                            if (!token.isCancellationRequested) {
                                vscode.window.showErrorMessage(
                                    'Failed to install uv. Please install it manually: https://docs.astral.sh/uv/getting-started/installation/'
                                );
                            }
                            return null;
                        }
                    } else {
                        this.outputChannel.appendLine('[ENV] uv is already installed');
                    }

                    // Check for cancellation
                    if (token.isCancellationRequested) {
                        return null;
                    }

                    // Step 2: Install pdf2zh
                    if (!status.pdf2zhInstalled) {
                        progress.report({ message: 'Installing pdf2zh...' });

                        const pdf2zhInstalled = await this.installPdf2zh(progress, token);
                        if (!pdf2zhInstalled) {
                            if (!token.isCancellationRequested) {
                                vscode.window.showErrorMessage(
                                    'Failed to install pdf2zh. Please check the Output panel for details.'
                                );
                            }
                            return null;
                        }
                    } else {
                        this.outputChannel.appendLine('[ENV] pdf2zh is already installed');
                    }

                    // Verify installation
                    progress.report({ message: 'Verifying installation...' });
                    const pdf2zhPath = await this.checkPdf2zhInstalled();

                    if (pdf2zhPath) {
                        vscode.window.showInformationMessage('PDF translation environment initialized successfully!');
                        return pdf2zhPath;
                    } else {
                        vscode.window.showErrorMessage(
                            'Environment setup completed but pdf2zh verification failed. Please restart VS Code and try again.'
                        );
                        return null;
                    }
                }
            );
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Check if initialization is in progress
     */
    isInitializationInProgress(): boolean {
        return this.isInitializing;
    }
}
