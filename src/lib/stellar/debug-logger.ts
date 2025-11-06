/**
 * @module lib/stellar/debug-logger
 * @description Centralized debug logging for SEP-24 flows
 * Enable/disable with DEBUG_SEP24 flag
 */

// 🔧 ENABLE/DISABLE DEBUGGING HERE
export const DEBUG_SEP24 = true; // Set to false to disable all logs

const LOG_PREFIX = "[SEP24]";
const COLORS = {
  info: "#3b82f6", // blue
  success: "#10b981", // green
  warning: "#f59e0b", // orange
  error: "#ef4444", // red
  sep1: "#8b5cf6", // purple
  sep10: "#ec4899", // pink
  sep24: "#06b6d4", // cyan
  store: "#f97316", // orange
  hook: "#14b8a6", // teal
  component: "#6366f1", // indigo
};

type LogLevel = "info" | "success" | "warning" | "error";
type LogModule = "sep1" | "sep10" | "sep24" | "store" | "hook" | "component";

interface LogData {
  [key: string]: any;
}

class SEP24Logger {
  private enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log with specific level and module
   */
  private log(
    level: LogLevel,
    module: LogModule,
    message: string,
    data?: LogData
  ) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
    const moduleColor = COLORS[module];
    const levelColor = COLORS[level];

    const emoji = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    }[level];

    console.groupCollapsed(
      `%c${LOG_PREFIX}%c [${module.toUpperCase()}] %c${emoji} ${message} %c${timestamp}`,
      `color: ${levelColor}; font-weight: bold`,
      `color: ${moduleColor}; font-weight: bold`,
      `color: ${levelColor}`,
      `color: #999; font-size: 0.9em`
    );

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`%c${key}:`, "color: #999; font-weight: bold", value);
      });
    }

    console.trace("Stack trace");
    console.groupEnd();
  }

  // SEP-1 Logs
  sep1Info(message: string, data?: LogData) {
    this.log("info", "sep1", message, data);
  }

  sep1Success(message: string, data?: LogData) {
    this.log("success", "sep1", message, data);
  }

  sep1Error(message: string, data?: LogData) {
    this.log("error", "sep1", message, data);
  }

  // SEP-10 Logs
  sep10Info(message: string, data?: LogData) {
    this.log("info", "sep10", message, data);
  }

  sep10Success(message: string, data?: LogData) {
    this.log("success", "sep10", message, data);
  }

  sep10Warning(message: string, data?: LogData) {
    this.log("warning", "sep10", message, data);
  }

  sep10Error(message: string, data?: LogData) {
    this.log("error", "sep10", message, data);
  }

  // SEP-24 Logs
  sep24Info(message: string, data?: LogData) {
    this.log("info", "sep24", message, data);
  }

  sep24Success(message: string, data?: LogData) {
    this.log("success", "sep24", message, data);
  }

  sep24Warning(message: string, data?: LogData) {
    this.log("warning", "sep24", message, data);
  }

  sep24Error(message: string, data?: LogData) {
    this.log("error", "sep24", message, data);
  }

  // Store Logs
  storeInfo(message: string, data?: LogData) {
    this.log("info", "store", message, data);
  }

  storeSuccess(message: string, data?: LogData) {
    this.log("success", "store", message, data);
  }

  // Hook Logs
  hookInfo(message: string, data?: LogData) {
    this.log("info", "hook", message, data);
  }

  hookSuccess(message: string, data?: LogData) {
    this.log("success", "hook", message, data);
  }

  hookWarning(message: string, data?: LogData) {
    this.log("warning", "hook", message, data);
  }

  hookError(message: string, data?: LogData) {
    this.log("error", "hook", message, data);
  }

  // Component Logs
  componentInfo(message: string, data?: LogData) {
    this.log("info", "component", message, data);
  }

  componentSuccess(message: string, data?: LogData) {
    this.log("success", "component", message, data);
  }

  componentWarning(message: string, data?: LogData) {
    this.log("warning", "component", message, data);
  }

  componentError(message: string, data?: LogData) {
    this.log("error", "component", message, data);
  }

  /**
   * Log flow start
   */
  flowStart(flowName: string, data?: LogData) {
    if (!this.enabled) return;
    console.log(
      `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      "color: #3b82f6"
    );
    console.log(
      `%c🚀 FLOW START: ${flowName}`,
      "color: #3b82f6; font-size: 1.2em; font-weight: bold"
    );
    if (data) {
      console.log("%cInitial data:", "color: #999; font-weight: bold", data);
    }
    console.log(
      `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      "color: #3b82f6"
    );
  }

  /**
   * Log flow end
   */
  flowEnd(flowName: string, success: boolean = true, data?: LogData) {
    if (!this.enabled) return;
    const color = success ? "#10b981" : "#ef4444";
    const emoji = success ? "✅" : "❌";
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, `color: ${color}`);
    console.log(
      `%c${emoji} FLOW END: ${flowName}`,
      `color: ${color}; font-size: 1.2em; font-weight: bold`
    );
    if (data) {
      console.log("%cFinal data:", "color: #999; font-weight: bold", data);
    }
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, `color: ${color}`);
  }

  /**
   * Log step in a flow
   */
  flowStep(stepNumber: number, stepName: string, data?: LogData) {
    if (!this.enabled) return;
    console.log(
      `%c▶ Step ${stepNumber}: ${stepName}`,
      "color: #8b5cf6; font-weight: bold"
    );
    if (data) {
      console.log(data);
    }
  }
}

// Export singleton instance
export const logger = new SEP24Logger(DEBUG_SEP24);

// Export convenience function to toggle debugging
export const enableDebug = () => logger.setEnabled(true);
export const disableDebug = () => logger.setEnabled(false);
export const isDebugEnabled = () => logger.isEnabled();

