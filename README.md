# Sensei-AI

**Sensei-AI** is your personal AI-powered senior developer inside VS Code. It analyzes your codebase like a technical lead, offering real-time suggestions, identifying bugs, improving code quality, and ensuring best practices across your projects.

---

## 🧠 Features

- 🔍 **Intelligent Code Scanning**  
  Deep code analysis across supported languages like C# and TypeScript using smart, configurable rules.

- 🛠 **Real-Time Suggestions in Sidebar**  
  Displays categorized improvement tips in a live-updating sidebar view.

- 🧪 **Untested Code Detection**  
  Highlights areas with low or no test coverage.

- 🔐 **Security & Performance Insights**  
  Automatically flags potential vulnerabilities and performance bottlenecks.

- 🎯 **Best Practice Recommendations**  
  Applies clean code principles and architecture recommendations tailored to .NET and TypeScript projects.

- ⚙️ **Project-Level Configuration**  
  Customize how and what to scan using `.senseiai.json`.

---

## 📦 Requirements

- **VS Code v1.85+**
- **Node.js v18+**
- Local file access permissions

---

## ⚙️ Extension Settings

This extension contributes the following settings:

- `sensei-ai.enable`: Enable or disable the extension.
- `sensei-ai.sidebar.autoOpen`: Automatically open the sidebar when a project is loaded.
- `sensei-ai.scanOnSave`: Enable automatic scanning on file save.
- `sensei-ai.configPath`: (Optional) Path to your `.senseiai.json` if outside root.

---

## 🧾 .senseiai.json Example

```json
{
  "include": ["**/*.cs", "**/*.ts"],
  "exclude": ["node_modules", "bin", "obj"],
  "maxFileSizeKB": 300,
  "scanDepth": "deep"
}
