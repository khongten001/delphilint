import * as vscode from "vscode";
import { LintIssue } from "./server";
import { getActiveProject } from "./delphiProjectUtils";
import { LintStatusItem } from "./statusBar";
import { Exclusive } from "./resource";

let statusItem: Exclusive<LintStatusItem> | undefined;

export function getStatusItem(): Exclusive<LintStatusItem> {
  if (!statusItem) {
    let statusItemRaw = new LintStatusItem(getActiveProject());
    statusItem = new Exclusive(statusItemRaw);
  }

  return statusItem;
}

export function showIssues(
  issues: LintIssue[],
  issueCollection: vscode.DiagnosticCollection
) {
  let files: Map<string, LintIssue[]> = issues.reduce(
    (aggregate, issue) =>
      aggregate.set(issue.file, [...(aggregate.get(issue.file) ?? []), issue]),
    new Map<string, LintIssue[]>()
  );

  for (const [fsPath, fileIssues] of files.entries()) {
    const uri = vscode.Uri.file(fsPath);
    let diagnostics: vscode.Diagnostic[] = [];

    for (const issue of fileIssues) {
      if (issue.range) {
        let diagnostic = new vscode.Diagnostic(
          new vscode.Range(
            issue.range.startLine - 1,
            issue.range.startOffset,
            issue.range.endLine - 1,
            issue.range.endOffset
          ),
          issue.message,
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = issue.ruleKey;

        diagnostics.push(diagnostic);
      }
    }

    issueCollection.set(uri, diagnostics);
  }
}

export function showInfo(msg: string) {
  vscode.window.showInformationMessage(msg);
}

export function showError(err: string) {
  vscode.window.showErrorMessage(err);
}
