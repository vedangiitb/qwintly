import { ToolCall } from "@langchain/core/messages";
import { ToolsRepository } from "../repository/tools.repository";
import {
  ToolExecutionContext,
  toolRegistry,
  ToolRegistry,
} from "../tools/tools";

const INVALID_TOOL_CALL_MESSAGE = "Invalid tool call";

type PersistToolCallParams = {
  toolCallRepo: ToolsRepository;
  chatId: string;
  messageId: string;
  toolCall: ToolCall;
  summary: unknown;
};

type UpdateToolCallMessageIdParams = {
  toolCallRepo: ToolsRepository;
  toolCallId: string;
  messageId: string;
};

type HandleToolCallParams = {
  toolName: string;
  args: unknown;
  chatId: string;
  messageId: string;
  toolId: string;
  toolDB: unknown;
};

export class ToolCallService {
  constructor(private readonly registry: ToolRegistry) {}

  async persist({
    toolCallRepo,
    chatId,
    messageId,
    toolCall,
    summary,
  }: PersistToolCallParams): Promise<string> {
    const { name: toolName, args } = toolCall;

    return toolCallRepo.insertToolCallDB({
      convId: chatId,
      messageId,
      toolName,
      args,
      summary,
    });
  }

  async updateMessageId({
    toolCallRepo,
    toolCallId,
    messageId,
  }: UpdateToolCallMessageIdParams): Promise<string> {
    return toolCallRepo.updateToolCallMessageId(toolCallId, messageId);
  }

  parse(toolName: string, args: unknown): unknown {
    const tool = this.registry.get(toolName);
    return tool ? tool.parse(args) : INVALID_TOOL_CALL_MESSAGE;
  }

  summarize(toolName: string, args: unknown): unknown {
    const tool = this.registry.get(toolName);
    return tool ? tool.summarize(args) : INVALID_TOOL_CALL_MESSAGE;
  }

  handle({
    toolName,
    args,
    chatId,
    messageId,
    toolId,
    toolDB,
  }: HandleToolCallParams): unknown {
    const tool = this.registry.get(toolName);
    if (!tool) return INVALID_TOOL_CALL_MESSAGE;

    const executionContext = {
      chatId,
      messageId,
      toolId,
      repository: toolDB,
    };

    return tool.handle(args, executionContext as ToolExecutionContext);
  }
}

export const toolCallService = new ToolCallService(toolRegistry);

export const persistToolCall = async (
  toolCallRepo: ToolsRepository,
  chatId: string,
  messageId: string,
  toolCall: ToolCall,
  summary: unknown,
): Promise<string> => {
  return toolCallService.persist({
    toolCallRepo,
    chatId,
    messageId,
    toolCall,
    summary,
  });
};

export const updateToolCallMessageId = async (
  toolCallRepo: ToolsRepository,
  toolCallId: string,
  messageId: string,
): Promise<string> => {
  return toolCallService.updateMessageId({
    toolCallRepo,
    toolCallId,
    messageId,
  });
};

export const parseToolCall = async (toolName: string, args: unknown) => {
  return toolCallService.parse(toolName, args);
};

export const getToolCallSummary = (
  toolName: string,
  args: unknown,
): unknown => {
  return toolCallService.summarize(toolName, args);
};

export const handleAiToolCall = (
  toolName: string,
  args: unknown,
  chatId: string,
  messageId: string,
  toolId: string,
  toolDB: unknown,
): unknown => {
  return toolCallService.handle({
    toolName,
    args,
    chatId,
    messageId,
    toolId,
    toolDB,
  });
};
