import { ChatController } from "../controller";
import { chatValidator } from "../validator";
type httpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace' | 'connect';
export const ChatRoutes = [
    {
        method: "post" as httpMethod,
        route: "/api/chat",
        controller: ChatController,
        action: "chat",
        validators: chatValidator
    }
]