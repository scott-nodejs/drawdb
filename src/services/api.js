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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    credentials: 'include',  // 包含 cookies
    mode: 'cors',  // 启用 CORS
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