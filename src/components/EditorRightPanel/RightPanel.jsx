/**
 * @description 右侧面板主组件 - 支持展开收起
 * @param {Object} props
 * @param {number} props.width - 面板宽度
 */
import { useState, useRef } from "react";
import { Tabs, Button, Input } from "@douyinfe/semi-ui";
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconTerminal,
  IconClock,
  IconSend
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import AIAssistant from './components/AIAssistant';

export default function RightPanel({ width }) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const aiAssistantRef = useRef(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      // 添加用户消息
      aiAssistantRef.current?.addMessage({
        role: 'user',
        content: inputValue
      });

      // 调用通义千问API
      const response = await fetch('你的API地址', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 你的API密钥'
        },
        body: JSON.stringify({
          model: "qwen-turbo", // 或其他模型ID
          messages: [
            {
              role: "system",
              content: "你是一个专业的数据库设计专家和SQL专家，可以帮助用户设计数据库和编写SQL。"
            },
            {
              role: "user",
              content: inputValue
            }
          ]
        })
      });

      const data = await response.json();
      
      // 添加AI回复
      aiAssistantRef.current?.addMessage({
        role: 'assistant',
        content: data.choices[0].message.content
      });

      setInputValue("");
    } catch (error) {
      console.error('Error:', error);
      // 可以添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* 面板主体 */}
      <div 
        style={{ width: isCollapsed ? 0 : width }}
        className={`relative flex-shrink-0 border-l border-color overflow-hidden transition-all duration-300`}
      >
        {/* 切换按钮 - 放在右上角 */}
        <Button
          type="tertiary"
          size="small"
          icon={isCollapsed ? <IconChevronLeft /> : <IconChevronRight />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-2 right-2 z-10 hover:bg-slate-100 ${
            isCollapsed ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
        />

        <div className={`w-full h-full flex flex-col ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}>
          {/* Tabs区域 */}
          <div className="flex-1 overflow-hidden">
            <Tabs 
              type="line"
              className="h-full px-2"
              tabBarStyle={{
                backgroundColor: 'var(--semi-color-bg-1)',
                padding: '8px 8px 0',
                borderBottom: '1px solid var(--semi-color-border)'
              }}
            >
              <Tabs.TabPane 
                tab={
                  <div className="flex items-center gap-2 px-2">
                    <IconTerminal />
                    <span>{t("AI助手")}</span>
                  </div>
                } 
                itemKey="1"
              >
                <div className="h-full pb-[120px]">
                  <AIAssistant ref={aiAssistantRef} />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane 
                tab={
                  <div className="flex items-center gap-2 px-2">
                    <IconClock />
                    <span>{t("历史记录")}</span>
                  </div>
                } 
                itemKey="2"
              >
                {/* 历史记录内容 */}
              </Tabs.TabPane>
            </Tabs>
          </div>

          {/* 输入区域 - 固定在底部 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t">
            <div className="p-4">
              <Input
                value={inputValue}
                onChange={setInputValue}
                placeholder={t("输入您的问题...")}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                size="large"
                className="shadow-sm"
                suffix={
                  <Button
                    theme="borderless"
                    type="primary"
                    icon={<IconSend />}
                    onClick={handleSend}
                    loading={isLoading}
                    disabled={!inputValue.trim()}
                    size="large"
                  />
                }
              />
              <div className="mt-2 text-xs text-gray-400 text-center">
                {t("AI助手将帮助您设计数据库和编写SQL")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 收起状态的切换按钮 */}
      {isCollapsed && (
        <Button
          type="tertiary"
          size="small"
          icon={<IconChevronLeft />}
          onClick={() => setIsCollapsed(false)}
          className="hover:bg-slate-100"
        />
      )}
    </div>
  );
} 