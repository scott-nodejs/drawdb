/**
 * @description AI助手对话组件
 */
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Avatar } from "@douyinfe/semi-ui";
import { 
  IconUser,
  IconGithubLogo 
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

const AIAssistant = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // 暴露添加消息的方法给父组件
  useImperativeHandle(ref, () => ({
    addMessage: (message) => {
      setMessages(prev => [...prev, message]);
    }
  }));

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="space-y-4 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar
                size="small"
                icon={message.role === 'user' ? <IconUser /> : <IconGithubLogo />}
                className={message.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'}
              />
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';
export default AIAssistant; 