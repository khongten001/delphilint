import * as vscode from 'vscode';
import { LintServer } from './server';
import { analyzeThisFile } from './command';
import { registerVersion } from './settings';

export function activate(context: vscode.ExtensionContext) {
  let server = new LintServer(14000);

  registerVersion(context.extension.packageJSON.version);

  let lintIssueCollection = vscode.languages.createDiagnosticCollection("delphilint");
  context.subscriptions.push(lintIssueCollection);

  let analyzeThisFileCommand = vscode.commands.registerCommand(
    'delphilint-vscode.analyzeThisFile',
    () => analyzeThisFile(server, lintIssueCollection)
  );
  context.subscriptions.push(analyzeThisFileCommand);
}