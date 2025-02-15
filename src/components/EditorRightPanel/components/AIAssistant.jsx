/**
 * @description AI助手对话组件
 */
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback, memo } from "react";
import { Avatar, Button, Spin, Toast } from "@douyinfe/semi-ui";
import { 
  IconUser,
  IconGithubLogo,
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../hooks";
import { generateSQL } from "../../../services/api";

const AIAssistant = forwardRef(({ onApplyDesign }, ref) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const isDarkMode = settings.mode === 'dark';
  const [messages, setMessages] = useState([]);
  const [currentStreamMessage, setCurrentStreamMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [loadingMessageId, setLoadingMessageId] = useState(null);

  // 优化流式消息处理
  const addStreamMessage = useCallback((content) => {
    console.log('Adding stream message:', content);
    
    setCurrentStreamMessage(prev => {
      // 使用函数式更新确保状态更新的一致性
      const newContent = prev + content;
      
      // 对新增的内容进行预处理，去除多余的空白字符
      return newContent.replace(/\s+$/, '');
    });
  }, []);

  // 优化流式消息完成处理
  const finishStreamMessage = useCallback(() => {
    console.log('Finishing stream message');
    
    setMessages(prev => {
      if (!currentStreamMessage.trim()) return prev;
      
      return [...prev, {
        role: 'assistant',
        content: currentStreamMessage
      }];
    });
    
    setCurrentStreamMessage('');
  }, [currentStreamMessage]);

  // 修改处理应用按钮点击的函数
  const handleApply = async (content, messageIndex) => {
    try {
      setLoadingMessageId(messageIndex);
      const response = await generateSQL(content);
      console.log('Apply response:', response);
      
      if (onApplyDesign) {
        const text = response.output.text;
        console.log('Raw text:', text);
        const jsonData = new Function(`return ${text}`)();
        onApplyDesign(jsonData);
      }
    } catch (error) {
      console.error('Apply error:', error);
      Toast.error(error.message || '应用失败');
    } finally {
      setLoadingMessageId(null);
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addMessage: (message) => {
      console.log('Adding message:', message);
      setMessages(prev => [...prev, message]);
    },
    addStreamMessage,
    finishStreamMessage
  }));

  // 优化的防抖滚动函数
  const debouncedScrollToBottom = useCallback(
    debounce(() => {
      if (chatContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
        const isScrolledToBottom = scrollHeight - clientHeight - scrollTop < 100;
        
        if (isScrolledToBottom) {
          chatContainerRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior: 'smooth'
          });
        }
      }
    }, 100),
    []
  );

  // 优化状态监听
  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, currentStreamMessage, debouncedScrollToBottom]);

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
          <MessageBubble 
            key={index} 
            message={message}
            isDarkMode={isDarkMode}
            onApply={(content) => handleApply(content, index)}
            isLoading={loadingMessageId === index}
          />
        ))}
        
        {currentStreamMessage && (
          <div className="animate-fadeIn">
            <MessageBubble 
              message={{
                role: 'assistant',
                content: currentStreamMessage
              }}
              isStreaming={true}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {isLoading && (
        <div className="fixed bottom-4 right-4">
          <Spin />
        </div>
      )}
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';

// 消息气泡组件
const MessageBubble = memo(({ message, isStreaming, isDarkMode, onApply, isLoading }) => {
  // 格式化消息内容
  const formatContent = useCallback((content) => {
    try {
      // 首先处理 \r\n 为换行符
      content = content.replace(/\\r\\n/g, '\n');
      
      // 处理代码块
      content = content.replace(/```(.*?)\n([\s\S]*?)```/g, (_, lang, code) => `
        <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg my-2 overflow-x-auto">
          <code>${code.trim()}</code>
        </pre>
      `);

      // 处理行内代码
      content = content.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>');

      // 处理标题
      content = content.replace(/### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
      content = content.replace(/## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
      content = content.replace(/# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

      // 处理列表
      content = content.replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="ml-4">$1</li>');
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc my-2 pl-4">$&</ul>');

      // 处理有序列表
      content = content.replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-4">$1</li>');
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ol class="list-decimal my-2 pl-4">$&</ol>');

      // 处理表格
      content = content.replace(
        /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g,
        (_, header, rows) => {
          const headers = header.split('|').map(h => h.trim()).filter(Boolean);
          const tableRows = rows.trim().split('\n').map(row => 
            row.split('|').map(cell => cell.trim()).filter(Boolean)
          );
          
          return `
            <div class="overflow-x-auto my-4">
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-700">
                    ${headers.map(h => `<th class="border border-gray-300 dark:border-gray-600 px-4 py-2">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.map(row => 
                    `<tr>${row.map(cell => 
                      `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`
                    ).join('')}</tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      );

      // 处理引用
      content = content.replace(
        /^> (.+)$/gm, 
        '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-600 dark:text-gray-400">$1</blockquote>'
      );

      // 处理加粗和斜体
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
      content = content.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

      // 处理链接
      content = content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>'
      );

      // 处理分隔线
      content = content.replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">');

      // 处理换行和段落
      content = content
        // 先处理连续的换行为段落
        .split(/\n\n+/)
        .map(p => p.trim() ? `<p class="my-2">${p}</p>` : '')
        .join('')
        // 然后处理单个换行为 <br>
        .replace(/\n/g, '<br>');

      return (
        <div 
          className={`markdown-content space-y-2 ${
            message.role === 'user' ? 'text-white' : ''
          }`}
          dangerouslySetInnerHTML={{ 
            __html: content
          }}
        />
      );
    } catch (error) {
      console.error('Error formatting content:', error);
      return <div>{content}</div>;
    }
  }, [message.role]);

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[85%]`}>
        {message.role === 'user' ? (
          <>
            <div className="flex-1">
              <div className={`relative p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-200' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {formatContent(message.content)}
                {isStreaming && (
                  <span className="inline-block w-1 h-4 ml-1 bg-current animate-blink" />
                )}
              </div>
            </div>
            <Avatar
              size="small"
              icon={<IconUser />}
              className="bg-blue-500 flex-shrink-0 mt-1"
            />
          </>
        ) : (
          <>
            <Avatar
              size="small"
              icon={<IconGithubLogo />}
              className="bg-gray-200 flex-shrink-0 mt-1"
            />
            <div className="flex-1">
              <div className={`relative p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-200' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formatContent(message.content)}
                {isStreaming && (
                  <span className="inline-block w-1 h-4 ml-1 bg-current animate-blink" />
                )}
              </div>
              {!isStreaming && message.role === 'assistant' && (
                <div className="mt-2 flex justify-end items-center gap-2">
                  <Button
                    theme="solid"
                    type="primary"
                    size="small"
                    onClick={() => onApply(message.content)}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? '应用中...' : '应用'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// 添加防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default AIAssistant; 