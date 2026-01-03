// 🔴 重要：请将下面的 sk-xxxx 替换为你申请的 DeepSeek API Key
const API_KEY = 'sk-xxxxxxxxxxxxxxxxxx'

// DeepSeek 的 API 地址
const API_URL = 'https://api.deepseek.com/chat/completions'

/**
 * AI 优化核心函数
 * @param {string} originalText - 用户输入的原始文本
 * @param {string} type - 优化类型 ('summary' | 'experience' | 'evaluation')
 */
export const optimizeText = async (originalText, type) => {
  if (!originalText || originalText.trim().length < 2) {
    throw new Error('请先填写一些内容再进行优化')
  }

  let systemPrompt = `
    你是一个专业的简历润色引擎（非聊天助手）。
    你的任务是接收用户输入的文本，根据要求进行润色，并直接输出润色后的纯文本。
    
    ⚠️ 严格遵守以下输出规则（重要）：
    1. 【禁止Markdown】：绝对不要使用 **加粗**、### 标题、- 列表符等Markdown语法。
    2. 【禁止废话】：不要输出 "好的"、"以下是优化后的内容"、"改写说明" 等前言后语。
    3. 【禁止解释】：不要解释你改了哪里，只输出改写后的最终结果。
    4. 【保留换行】：可以通过换行来区分段落或要点，但不要用符号。
  `

  if (type === 'summary') {
    // 个人简介
    systemPrompt +=
      "要求：突出核心优势，语言简练自信，字数控制在300字以内。去除废话，用第三人称视角的客观语气（但不要出现'他/她'，直接描述）。"
  } else if (type === 'experience') {
    // 工作经历
    systemPrompt +=
      "要求：使用'STAR法则'（情境、任务、行动、结果）重写。多使用强有力的动词开头（如：主导、构建、优化），量化工作成果（如：提升了20%效率）。不要改变原意，但要极大地提升专业度。"
  } else if (type === 'evaluation') {
    // 自我评价
    systemPrompt +=
      "要求：避免'吃苦耐劳'等空洞词汇。结合软技能（沟通、协作）和硬技能背景，写出具有职业素养的评价。分点描述，条理清晰。"
  }

  // 发送请求给大模型
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: originalText },
        ],
        temperature: 0.7, // 0.7 比较平衡，可以修改
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    // 返回
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('AI 优化出错:', error)
    throw error
  }
}
