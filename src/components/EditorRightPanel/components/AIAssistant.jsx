/**
 * @description AI助手对话组件
 */
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Avatar, Button, Spin } from "@douyinfe/semi-ui";
import { 
  IconUser,
  IconGithubLogo,
  IconCode
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../hooks";  // 添加这行

const AIAssistant = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { settings } = useSettings();  // 获取主题设置
  const isDarkMode = settings.mode === 'dark';
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 暴露添加消息的方法给父组件
  useImperativeHandle(ref, () => ({
    addMessage: (message) => {
      if (message.role === 'user') {
        // 用户消息直接添加
        setMessages(prev => [...prev, message]);
        // 显示机器人正在输入
        setIsTyping(true);
      } else {
        // AI回复时关闭输入状态
        setIsTyping(false);
        setMessages(prev => [...prev, { ...message, jsonData: message.jsonData }]);
      }
    }
  }));

  // 优化的滚动到底部函数
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // 监听消息变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听高度变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(scrollToBottom);
    if (chatContainerRef.current) {
      resizeObserver.observe(chatContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  // 格式化表结构内容
  const formatTableContent = (table) => {
    const fields = table.fields.map(field => {
      const attributes = [];
      if (field.primary) attributes.push('主键');
      if (field.unique) attributes.push('唯一');
      if (field.notNull) attributes.push('非空');
      if (field.increment) attributes.push('自增');
      
      const attributesStr = attributes.length ? ` (${attributes.join(', ')})` : '';
      return `${field.name}: ${field.type}${field.size ? `(${field.size})` : ''}${attributesStr}\n${field.comment}`;
    }).join('\n');

    return (
      <div key={table.name} className="mb-4 last:mb-0">
        {/* 表名和描述 - 第一级 */}
        <div className={`font-medium text-base mb-2 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {table.name}
        </div>
        
        {/* 表描述和字段 - 第二级 */}
        <div className={`rounded-md p-3 text-sm ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className={`mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {table.comment}
          </div>
          
          {/* 字段列表 */}
          <div className="space-y-2">
            {table.fields.map(field => {
              const attributes = [];
              if (field.primary) attributes.push('主键');
              if (field.unique) attributes.push('唯一');
              if (field.notNull) attributes.push('非空');
              if (field.increment) attributes.push('自增');
              
              return (
                <div key={field.name} className={`pl-2 border-l-2 ${
                  isDarkMode 
                    ? 'border-gray-600' 
                    : 'border-gray-300'
                }`}>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {field.name}: {field.type}
                    {field.size ? `(${field.size})` : ''}
                    {attributes.length > 0 && (
                      <span className={`ml-1 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}>
                        ({attributes.join(', ')})
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {field.comment}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={chatContainerRef}
      className={`h-[calc(100vh-280px)] overflow-y-auto scroll-smooth ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: isDarkMode 
          ? 'rgba(200, 200, 200, 0.5) transparent'
          : 'rgba(155, 155, 155, 0.5) transparent'
      }}
    >
      <div className="space-y-4 p-4">
        {messages.map((message, index) => (
          <div key={index} className="animate-fadeIn">
            <div className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}>
                <Avatar
                  size="small"
                  icon={message.role === 'user' ? <IconUser /> : <IconGithubLogo />}
                  className={message.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'}
                />
                <div className={`relative p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : isDarkMode 
                      ? 'bg-gray-800 text-gray-100' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.role === 'assistant' && message.jsonData ? (
                    <div>
                      {message.jsonData.tables.map(formatTableContent)}
                      {/* 在AI回复内容下方添加应用按钮 */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          theme="solid"
                          type="primary"
                          icon={<IconCode />}
                          onClick={() => props.onApplyDesign(message.jsonData)}
                          className="w-full"
                        >
                          {t("应用设计")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* 显示正在输入的状态 */}
        {isTyping && (
          <div className="animate-fadeIn">
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar
                  size="small"
                  icon={<IconGithubLogo />}
                  className="bg-gray-200"
                />
                <div className={`p-3 rounded-lg min-w-[60px] min-h-[40px] ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <Spin
                    spinning
                    size="small"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';
export default AIAssistant; 