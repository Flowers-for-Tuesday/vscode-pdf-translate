import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class PDFViewerPanel {
    public static currentPanel: PDFViewerPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly pdfPath: string;
    private disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, pdfPath: string, viewColumn?: vscode.ViewColumn): PDFViewerPanel {
        const column = viewColumn || vscode.ViewColumn.Beside;

        // If we already have a panel, show it
        if (PDFViewerPanel.currentPanel) {
            PDFViewerPanel.currentPanel.panel.reveal(column);
            PDFViewerPanel.currentPanel.updatePDF(pdfPath);
            return PDFViewerPanel.currentPanel;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'pdfViewer',
            'PDF Viewer',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.dirname(pdfPath)),
                    extensionUri
                ]
            }
        );

        PDFViewerPanel.currentPanel = new PDFViewerPanel(panel, extensionUri, pdfPath);
        return PDFViewerPanel.currentPanel;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, pdfPath: string) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.pdfPath = pdfPath;

        // Set the webview's initial html content
        this.updateWebview();

        // Listen for when the panel is disposed
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // Update the content based on view state changes
        this.panel.onDidChangeViewState(
            e => {
                if (this.panel.visible) {
                    this.updateWebview();
                }
            },
            null,
            this.disposables
        );
    }

    public updatePDF(pdfPath: string): void {
        // Update the PDF path and refresh the webview
        const pdfUri = this.panel.webview.asWebviewUri(vscode.Uri.file(pdfPath));
        this.panel.webview.postMessage({
            command: 'updatePDF',
            pdfUri: pdfUri.toString()
        });

        // Update title
        this.panel.title = path.basename(pdfPath);
    }

    private updateWebview(): void {
        this.panel.webview.html = this.getHtmlForWebview(this.pdfPath);
        this.panel.title = path.basename(this.pdfPath);
    }

    private getHtmlForWebview(pdfPath: string): string {
        const pdfUri = this.panel.webview.asWebviewUri(vscode.Uri.file(pdfPath));
        const fileName = path.basename(pdfPath);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Viewer - ${fileName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #525659;
        }
        #toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 40px;
            background-color: #323639;
            display: flex;
            align-items: center;
            padding: 0 10px;
            gap: 10px;
            z-index: 1000;
            color: #ffffff;
        }
        #toolbar button {
            background-color: #4a4a4a;
            color: white;
            border: none;
            padding: 5px 15px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 14px;
        }
        #toolbar button:hover {
            background-color: #5a5a5a;
        }
        #toolbar button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        #pageInfo {
            color: #cccccc;
            font-size: 14px;
        }
        #pageInput {
            width: 50px;
            text-align: center;
            background-color: #4a4a4a;
            color: white;
            border: 1px solid #666;
            border-radius: 3px;
            padding: 3px;
        }
        #zoom {
            margin-left: auto;
            color: #cccccc;
        }
        #zoomLevel {
            width: 60px;
            background-color: #4a4a4a;
            color: white;
            border: 1px solid #666;
            border-radius: 3px;
            padding: 3px;
        }
        #pdfContainer {
            position: absolute;
            top: 40px;
            bottom: 0;
            left: 0;
            right: 0;
            overflow: auto;
            display: flex;
            justify-content: center;
            padding: 20px;
        }
        #pdfCanvas {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            background: white;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
        }
        .error {
            color: #ff6b6b;
        }
    </style>
</head>
<body>
    <div id="toolbar">
        <button id="prevPage">Previous</button>
        <input type="number" id="pageInput" min="1" value="1" />
        <span id="pageInfo">/ 0</span>
        <button id="nextPage">Next</button>
        <div id="zoom">
            <label for="zoomLevel">Zoom:</label>
            <select id="zoomLevel">
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1" selected>100%</option>
                <option value="1.25">125%</option>
                <option value="1.5">150%</option>
                <option value="2">200%</option>
            </select>
        </div>
    </div>
    <div id="pdfContainer">
        <div class="loading">Loading PDF...</div>
        <canvas id="pdfCanvas"></canvas>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        (function() {
            const loading = document.querySelector('.loading');

            // Check if PDF.js loaded
            if (typeof pdfjsLib === 'undefined') {
                loading.textContent = 'Error: Failed to load PDF.js library';
                loading.classList.add('error');
                return;
            }

            // Configure PDF.js worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            let pdfDoc = null;
            let pageNum = 1;
            let pageRendering = false;
            let pageNumPending = null;
            let scale = 1;

            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            const pageInput = document.getElementById('pageInput');
            const pageInfo = document.getElementById('pageInfo');
            const prevButton = document.getElementById('prevPage');
            const nextButton = document.getElementById('nextPage');
            const zoomSelect = document.getElementById('zoomLevel');

            // PDF URL
            const pdfUrl = '${pdfUri.toString()}';
            console.log('Loading PDF from:', pdfUrl);

            // Load PDF
            pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
                console.log('PDF loaded successfully, pages:', pdf.numPages);
                pdfDoc = pdf;
                pageInfo.textContent = '/ ' + pdf.numPages;
                pageInput.max = pdf.numPages;
                loading.style.display = 'none';
                renderPage(pageNum);
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                loading.textContent = 'Error loading PDF: ' + error.message;
                loading.classList.add('error');
            });

            function renderPage(num) {
                if (!pdfDoc) return;

                pageRendering = true;
                pdfDoc.getPage(num).then(function(page) {
                    const viewport = page.getViewport({ scale: scale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };

                    const renderTask = page.render(renderContext);
                    renderTask.promise.then(function() {
                        pageRendering = false;
                        if (pageNumPending !== null) {
                            renderPage(pageNumPending);
                            pageNumPending = null;
                        }
                    }).catch(function(error) {
                        console.error('Error rendering page:', error);
                        pageRendering = false;
                    });
                }).catch(function(error) {
                    console.error('Error getting page:', error);
                    pageRendering = false;
                });

                pageInput.value = num;
                updateButtons();
            }

            function queueRenderPage(num) {
                if (pageRendering) {
                    pageNumPending = num;
                } else {
                    renderPage(num);
                }
            }

            function updateButtons() {
                if (!pdfDoc) return;
                prevButton.disabled = pageNum <= 1;
                nextButton.disabled = pageNum >= pdfDoc.numPages;
            }

            prevButton.addEventListener('click', function() {
                if (pageNum <= 1) return;
                pageNum--;
                queueRenderPage(pageNum);
            });

            nextButton.addEventListener('click', function() {
                if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
                pageNum++;
                queueRenderPage(pageNum);
            });

            pageInput.addEventListener('change', function() {
                if (!pdfDoc) return;
                const num = parseInt(this.value);
                if (num >= 1 && num <= pdfDoc.numPages) {
                    pageNum = num;
                    queueRenderPage(pageNum);
                } else {
                    this.value = pageNum;
                }
            });

            zoomSelect.addEventListener('change', function() {
                scale = parseFloat(this.value);
                queueRenderPage(pageNum);
            });

            // Listen for messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'updatePDF':
                        window.location.reload();
                        break;
                }
            });
        })();
    </script>
</body>
</html>`;
    }

    public dispose(): void {
        PDFViewerPanel.currentPanel = undefined;

        this.panel.dispose();

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
