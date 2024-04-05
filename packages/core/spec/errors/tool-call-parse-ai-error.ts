import { LanguageModelV1FunctionTool } from '../language-model/v1/language-model-v1-function-tool';
import { getErrorMessage } from '../util/get-error-message';

export class ToolCallParseAIError extends Error {
  readonly cause: unknown;
  readonly text: string;
  readonly tools: LanguageModelV1FunctionTool[];

  constructor({
    cause,
    text,
    tools,
    message = `Failed to parse tool calls: ${getErrorMessage(cause)}`,
  }: {
    cause: unknown;
    text: string;
    tools: LanguageModelV1FunctionTool[];
    message?: string;
  }) {
    super(message);

    this.name = 'ToolCallParseAIError';

    this.cause = cause;
    this.text = text;
    this.tools = tools;
  }

  static isToolCallParseAIError(error: unknown): error is ToolCallParseAIError {
    return (
      error instanceof Error &&
      error.name === 'ToolCallParseAIError' &&
      'cause' in error &&
      error.cause != undefined &&
      'text' in error &&
      error.text != undefined &&
      typeof error.text === 'string' &&
      'tools' in error &&
      error.tools != undefined
    );
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,

      cause: this.cause,
      text: this.text,
      tools: this.tools,
    };
  }
}