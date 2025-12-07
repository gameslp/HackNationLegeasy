import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendSuccess } from '../middleware/response';
import { AppError } from '../middleware/errorHandler';
import { processChat, ChatMessage } from '../services/chatService';

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: ChatMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new AppError('Messages are required', 'VALIDATION_ERROR', 400);
  }

  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      throw new AppError('Invalid message role', 'VALIDATION_ERROR', 400);
    }
    if (typeof msg.content !== 'string') {
      throw new AppError('Message content must be a string', 'VALIDATION_ERROR', 400);
    }
  }

  // Limit conversation history to prevent token overflow
  const limitedMessages = messages.slice(-20);

  const response = await processChat(limitedMessages);

  sendSuccess(res, { response });
});
