import * as vscode from 'vscode';

export class SenseiAISidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'senseiAIView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
  }

  updateResults(results: string[]) {
    if (this._view) {
      this._view.webview.postMessage({ type: 'updateResults', payload: results });
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: sans-serif; padding: 10px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <h2>📊 SenseiAI Results</h2>
        <ul id="results"></ul>
        <script>
          const vscode = acquireVsCodeApi();
          window.addEventListener('message', (event) => {
            const { type, payload } = event.data;
            if (type === 'updateResults') {
              const results = payload;
              const ul = document.getElementById('results');
              ul.innerHTML = '';
              results.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
              });
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
