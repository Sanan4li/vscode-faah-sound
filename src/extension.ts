import * as cp from "child_process";
import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const soundPath = path.join(context.extensionPath, "media", "error.mp3");

  vscode.window.onDidCloseTerminal(() => {});

  const disposable = vscode.window.onDidEndTerminalShellExecution((e) => {
    if (e.exitCode !== undefined && e.exitCode !== 0) {
      playSound(soundPath);
    }
  });

  context.subscriptions.push(disposable);
}

function playSound(filePath: string) {
  const platform = process.platform;

  if (platform === "win32") {
    cp.exec(
      `powershell -c (New-Object Media.SoundPlayer '${filePath}').PlaySync()`,
    );
  } else if (platform === "darwin") {
    cp.exec(`afplay "${filePath}"`);
  } else {
    // Try common Linux audio players in order of preference
    cp.exec(
      `paplay "${filePath}" 2>/dev/null || ` +
        `aplay "${filePath}" 2>/dev/null || ` +
        `ffplay -nodisp -autoexit "${filePath}" 2>/dev/null || ` +
        `mpg123 "${filePath}" 2>/dev/null || ` +
        `cvlc --play-and-exit "${filePath}" 2>/dev/null`,
      (err) => {
        if (err) {
          vscode.window.showWarningMessage(
            "Terminal Sound: No audio player found on Linux. Install pulseaudio-utils, alsa-utils, ffmpeg, mpg123, or vlc.",
          );
        }
      },
    );
  }
}

export function deactivate() {}
