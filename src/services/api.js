/**
 * @description API服务
 */

const API_BASE_URL = 'http://localhost:9091/api';

/**
 * @description 生成SQL的请求配置
 * @param {string} description - 用户输入的描述
 * @param {string} sessionId - 会话ID，可选
 * @returns {Promise<Object>} 返回解析后的JSON数据，包含新的 sessionId
 * @throws {Error} 当请求失败或解析失败时抛出错误
 */
export const generateSQL = async (description, sessionId = '') => {
  const response = await fetch(`${API_BASE_URL}/sql/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      description,
      ...(sessionId ? { sessionId } : {})
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== "0000") {
    throw new Error(data.message || "请求失败");
  }
  
  return data.response;
};

/**
 * @description 生成SQL的流式请求配置
 * @param {string} description - 用户输入的描述
 * @param {string} sessionId - 会话ID，可选
 * @param {function} onProgress - 处理流式输出的回调函数
 * @returns {Promise<void>}
 * @throws {Error} 当请求失败时抛出错误
 */
export const generateSQLStream = async (description, sessionId = '', onProgress) => {
  console.log('Starting stream request with:', { description, sessionId });
  
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let currentSessionId = sessionId;

    // 发送 POST 请求并获取响应
    fetch(`${API_BASE_URL}/sql/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        description,
        sessionId: currentSessionId || ''
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // 读取流数据
      function readStream() {
        reader.read().then(({done, value}) => {
          if (done) {
            console.log('Stream complete');
            resolve({ sessionId: currentSessionId });
            return;
          }

          // 解码并处理数据
          const text = decoder.decode(value, {stream: true});
          buffer += text;
          
          // 处理接收到的数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data:')) {
              try {
                const content = line.slice(5).trim();
                
                // 检查是否是会话信息
                if (content.includes('"session_id"')) {
                  try {
                    const sessionData = JSON.parse(content);
                    if (sessionData.session_id) {
                      currentSessionId = sessionData.session_id;
                      console.log('Received session ID:', currentSessionId);
                    }
                    continue;
                  } catch (e) {
                    console.error('Error parsing session data:', e);
                  }
                }

                if (content && content !== 'DONE') {
                  // 清理内容
                  const cleanContent = content
                    .replace(/^event:.*$/gm, '')
                    .replace(/^id:.*$/gm, '')
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\"/g, '"')
                    .replace(/^"|"$/g, '')
                    .replace(/\\/g, '');

                  if (cleanContent.trim()) {
                    console.log('Clean content:', cleanContent);
                    onProgress(cleanContent);
                  }
                }
              } catch (error) {
                console.error('Error processing message:', error);
              }
            }
          }

          // 继续读取
          readStream();
        }).catch(error => {
          console.error('Stream error:', error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(readStream, 1000 * retryCount);
          } else {
            reject(new Error('连接失败，请稍后重试'));
          }
        });
      }

      // 开始读取流
      readStream();

    }).catch(error => {
      console.error('Request error:', error);
      reject(new Error(`请求失败: ${error.message}`));
    });

    // 添加超时处理
    const timeout = setTimeout(() => {
      reject(new Error('请求超时，请稍后重试'));
    }, 30000);
  });
};

/**
 * @description 解析API返回的数据
 * @param {Object} data - API返回的原始数据
 * @returns {Object} 解析后的数据，包含 content 和 jsonData
 * @throws {Error} 当解析失败时抛出错误
 */
export const parseAPIResponse = (data) => {
  // 获取原始文本
  const text = data.output.text;
  console.log('Raw text:', text);

  // 使用 Function 构造器安全地解析 JavaScript 对象字面量
  try {
    const jsonData = new Function(`return ${text}`)();
    console.log('Parsed data:', jsonData);

    if (!jsonData || !jsonData.tables || !Array.isArray(jsonData.tables)) {
      throw new Error('Invalid JSON structure');
    }

    // 生成表结构的文本描述
    const tablesContent = jsonData.tables.map(table => {
      const fields = table.fields.map(field => {
        const attributes = [];
        if (field.primary) attributes.push('主键');
        if (field.unique) attributes.push('唯一');
        if (field.notNull) attributes.push('非空');
        if (field.increment) attributes.push('自增');
        
        const attributesStr = attributes.length ? ` (${attributes.join(', ')})` : '';
        return `    - ${field.name}: ${field.type}${field.size ? `(${field.size})` : ''}${attributesStr}\n      ${field.comment}`;
      }).join('\n');

      return `表: ${table.name}\n描述: ${table.comment}\n字段:\n${fields}`;
    }).join('\n\n');

    return {
      content: tablesContent,
      jsonData: jsonData
    };
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error(`解析失败: ${error.message}`);
  }
}; 