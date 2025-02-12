/**
 * @description 右侧面板主组件 - 支持展开收起和宽度调整
 */
import { useState, useRef, useCallback } from "react";
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
import { 
  useDiagram,
  useAreas,
  useNotes,
  useTypes,
  useEnums,
  useSettings
} from '../../hooks';
import { generateSQL, parseAPIResponse } from '../../services/api';

export default function RightPanel() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const aiAssistantRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const resizeRef = useRef(null);
  const isResizingRef = useRef(false);
  const [currentSessionId, setCurrentSessionId] = useState('');  // 修改为 currentSessionId
  
  // 获取所有需要的状态更新函数
  const { setTables, setRelationships } = useDiagram();
  const { setAreas } = useAreas();
  const { setNotes } = useNotes();
  const { setTypes } = useTypes();
  const { setEnums } = useEnums();
  const { settings } = useSettings();
  const isDarkMode = settings.mode === 'dark';

  // 处理拖动调整宽度
  const handleMouseDown = useCallback((e) => {
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizingRef.current) return;
    
    // 计算新宽度，从右侧向左拖动
    const newWidth = window.innerWidth - e.clientX;
    // 限制最小和最大宽度
    const clampedWidth = Math.min(Math.max(newWidth, 280), 800);
    setPanelWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleApplyDesign = (jsonData) => {
    try {
      console.log('Applying design:', jsonData); // 添加日志
      
      // 先清空现有数据
      setTables([]);
      setRelationships([]);
      setAreas([]);
      setNotes([]);
      setTypes([]);
      setEnums([]);

      // 按顺序设置数据，确保表先创建
      setTables(jsonData.tables || []);
      
      // 处理关系数据，确保使用正确的属性名
      if (jsonData.relationships && Array.isArray(jsonData.relationships)) {
        console.log('Setting relationships:', jsonData.relationships); // 添加日志
        setRelationships(jsonData.relationships.map(rel => ({
          ...rel,
          // 确保ID字段存在
          id: rel.id || Date.now(),
          // 确保所有必需的字段都存在
          startTableId: rel.startTableId,
          startFieldId: rel.startFieldId,
          endTableId: rel.endTableId,
          endFieldId: rel.endFieldId,
          name: rel.name || '',
          cardinality: rel.cardinality || 'Many to one',
          updateConstraint: rel.updateConstraint || 'No action',
          deleteConstraint: rel.deleteConstraint || 'No action'
        })));
      }

      // 设置其他数据
      setAreas(jsonData.areas || []);
      setNotes(jsonData.notes || []);
      setTypes(jsonData.types || []);
      setEnums(jsonData.enums || []);
    } catch (error) {
      console.error('Error applying design:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      // 添加用户消息
      aiAssistantRef.current?.addMessage({
        role: 'user',
        content: inputValue
      });

      // 调用 API 服务，传入当前的 sessionId
      const data = await generateSQL(inputValue, currentSessionId);
      
      try {
        // 解析返回数据
        const { content, jsonData } = parseAPIResponse(data);
        
        // 更新 sessionId
        if (data.sessionId) {
          setCurrentSessionId(data.sessionId);
        }
        
        // 添加AI回复
        aiAssistantRef.current?.addMessage({
          role: 'assistant',
          content: content,
          jsonData: jsonData
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // 如果解析失败，直接显示原始文本
        aiAssistantRef.current?.addMessage({
          role: 'assistant',
          content: `解析失败: ${parseError.message}\n\n原始数据:\n${data.output.text}`
        });
      }

      setInputValue("");
    } catch (error) {
      console.error('Error:', error);
      // 添加错误消息
      aiAssistantRef.current?.addMessage({
        role: 'assistant',
        content: `发生错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* 拖动调整宽度的把手 */}
      <div
        ref={resizeRef}
        className={`w-1 hover:bg-blue-400 cursor-col-resize ${
          isResizingRef.current ? 'bg-blue-400' : 'bg-transparent'
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* 面板主体 */}
      <div 
        style={{ 
          width: isCollapsed ? 0 : panelWidth,
          minWidth: isCollapsed ? 0 : 280,
          maxWidth: 800
        }}
        className={`relative flex-shrink-0 border-l border-color overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
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
          {/* Tabs区域 - 固定在顶部 */}
          <Tabs 
            type="line"
            className="flex-shrink-0"
            tabBarStyle={{
              backgroundColor: isDarkMode ? 'var(--semi-color-bg-2)' : 'var(--semi-color-bg-1)',
              borderBottom: '1px solid var(--semi-color-border)'
            }}
            itemType="card"
            size="small"
          >
            <Tabs.TabPane 
              tab={
                <div className="flex items-center gap-2 px-1">
                  <IconTerminal size="small" />
                  <span className="text-sm">{t("AI助手")}</span>
                </div>
              } 
              itemKey="1"
            >
              {/* 内容区域 - 可滚动 */}
              <div className="h-[calc(100vh-180px)] relative">
                <AIAssistant 
                  ref={aiAssistantRef} 
                  onApplyDesign={handleApplyDesign}
                />
                {/* 输入区域 - 固定在底部 */}
                <div className={`absolute bottom-0 left-0 right-0 border-t ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="p-4">
                    <Input
                      value={inputValue}
                      onChange={setInputValue}
                      placeholder={t("输入您的问题...")}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      size="large"
                      className={`shadow-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white'
                      }`}
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
                    <div className={`mt-2 text-xs text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t("AI助手将帮助您设计数据库和编写SQL")}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane 
              tab={
                <div className="flex items-center gap-2 px-1">
                  <IconClock size="small" />
                  <span className="text-sm">{t("历史记录")}</span>
                </div>
              } 
              itemKey="2"
            >
              {/* 历史记录内容 */}
            </Tabs.TabPane>
          </Tabs>
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