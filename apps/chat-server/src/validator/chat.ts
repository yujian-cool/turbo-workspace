import { check, validationResult } from 'express-validator';

// 32位uuid，用于标识会话。消息不为空
export const chatValidator = [
    check('conversationId').isLength({ min: 32, max: 32 }),
    // check('conversationId').isLength({ min: 1 }),
    check('message').isLength({ min: 1 })
]