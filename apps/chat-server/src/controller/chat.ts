import client from "../redis"
import OpenAI from "openai";
import { NextFunction, Request, Response } from "express"

require('dotenv').config()

const OPENAI_ASSISTANTS_ID = process.env.OPENAI_ASSISTANTS_ID as string
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string
const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION as string


export class ChatController {

    private openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        organization: OPENAI_ORGANIZATION,
    });

    async chat(request: Request, response: Response, next: NextFunction) {
        try {
            const { message, conversationId } = request.body;
            console.log(message, conversationId);

            // 确保 Redis 客户端连接
            if (!client.isOpen) {
                await client.connect();
            }

            let threadId = await client.get('leishan:' + conversationId);
            console.log('threadId', threadId);
            let thread

            if (!threadId) {
                thread = await this.openai.beta.threads.create();
                threadId = thread.id;
            }

            await this.openai.beta.threads.messages.create(threadId, {
                role: 'user',
                content: message,
            });

            const run = await this.openai.beta.threads.runs.create(threadId, {
                assistant_id: OPENAI_ASSISTANTS_ID,
            });

            /**
             * 
             * @param threadId openai thread id
             * @param searchFn openai messages list
             * @param interval delay time 100ms
             * @param timeout  timeout 60s
             * @returns 
             */
            const pollForResponse = async (threadId: string, interval: number = 100, timeout: number = 60000) => {
                const startTime = Date.now();
                const poll = async (resolve: Function, reject: Function) => {
                    const elapsedTime = Date.now() - startTime;
                    console.log('poll', elapsedTime);
                    if (elapsedTime > timeout) {
                        return reject(new Error('Timeout waiting for response'));
                    }
                    const _run = await this.openai.beta.threads.runs.retrieve(
                        threadId,
                        run.id
                    );
                    console.log('_run', _run);
                    if (_run.status === 'completed') {
                        const result = await this.openai.beta.threads.messages.list(threadId);
                        const latestMessage = result.data[0];
                        console.log('latestMessage', latestMessage);
                        return resolve(latestMessage);
                    } else {
                        setTimeout(() => poll(resolve, reject), interval);
                    }
                };

                return new Promise(poll);
            };

            // 获取最新的 AI 响应
            const latestResponse = await pollForResponse(threadId);

            // 更新 Redis 中的 threadId
            await client.set('leishan:' + conversationId, threadId);

            // 返回 AI 响应
            return response.status(200).send({
                code: 20000,
                data: latestResponse, // 发送最新响应
                message: '请求成功'
            });
        }
        catch (error) {
            return response.status(200).send({
                code: 40000,
                message: '请求失败'
            })
        }
    }
}