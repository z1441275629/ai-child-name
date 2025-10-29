import { useState } from 'react';
import './App.css';

// 定义名字结果的类型
interface NameResult {
  chineseName: string;
  chineseMeaning: string;
  fiveElementsAnalysis: string;
}

function App() {
  // 表单状态
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [babyGender, setBabyGender] = useState('male');
  // 新增：定制字和名字长度功能
  const [customCharacter, setCustomCharacter] = useState('');
  const [isGeneration, setIsGeneration] = useState(false);
  const [nameLength, setNameLength] = useState(3);
  // 新增：父母寄语功能
  const [parentMessage, setParentMessage] = useState('');
  // 新增：额外起名规则功能
  const [extraRules, setExtraRules] = useState('');
  
  // 结果状态 
  const [nameResults, setNameResults] = useState<NameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 生成名字的函数
  const generateNames = async () => {
    // 表单验证
    if (!fatherName || !motherName) {
      setError('请填写父母姓名');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 构建API请求
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的新生儿命名师，擅长根据父母信息和中国文化传统为新生儿起名字。'
            },
            {
              role: 'user',
              content: `请为新生儿起9个中文名，要求：
1. 结合父母信息：父亲姓名${fatherName}，母亲姓名${motherName}。
2. 宝宝性别：${babyGender === 'male' ? '男' : '女'}。
3. 每个名字必须体现中国文化内涵，包含美好的寓意。
4. 名字长度为${nameLength}个汉字。
5. 名字的第一个字必须是爸爸的姓，也就是父亲姓名"${fatherName}"的第一个字。
${customCharacter ? (isGeneration ? '6. 名字必须包含辈份字"' + customCharacter + '"，且该字必须放在第二个位置。\n' : '6. 名字必须包含字"' + customCharacter + '"，该字可以放在第二个或第三个位置。\n') : ''}${parentMessage ? '7. 结合父母寄语："' + parentMessage + '"，在名字寓意中体现相关内容。\n' : ''}${extraRules ? '8. ' + extraRules + '\n' : ''}${(customCharacter || parentMessage || extraRules) ? '' : '6. '}请以JSON格式返回结果，包含chineseName（中文名）、chineseMeaning（中文寓意解释）和fiveElementsAnalysis（从五行的角度分析名字的好处）字段。
${(customCharacter || parentMessage || extraRules) ? '9' : '7'}. 不要包含任何JSON之外的文字。`
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 解析API返回的内容
      const content = data.choices[0].message.content;
      console.log('API原始返回内容:', content);
      
      try {
        // 尝试直接解析内容
        const namesData = JSON.parse(content);
        console.log('直接解析结果:', namesData);
        
        // 检查是否为数组
        if (Array.isArray(namesData) && namesData.length > 0) {
          setNameResults(namesData);
          return;
        }
      } catch (parseError) {
        console.log('直接解析失败，尝试提取JSON部分:', parseError);
      }
      
      // 如果直接解析失败，尝试提取JSON内容（移除可能的markdown代码块）
      const jsonMatch = content.match(/```json\s*([\s\S]*)\s*```/) || 
                        content.match(/```[\s\S]*?\n([\s\S]*?)\n```/) || 
                        content.match(/\{[\s\S]*\}/);
                        
      if (!jsonMatch || !jsonMatch[1]) {
        console.error('无法提取有效的JSON内容');
        // 作为最后的尝试，使用正则表达式提取可能的JSON对象数组
        const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch && arrayMatch[0]) {
          try {
            const namesData = JSON.parse(arrayMatch[0]);
            if (Array.isArray(namesData) && namesData.length > 0) {
              setNameResults(namesData);
              return;
            }
          } catch (e) {
            console.error('提取数组解析失败:', e);
          }
        }
        throw new Error('无法解析API返回的JSON内容');
      }
      
      try {
        const namesData = JSON.parse(jsonMatch[1]);
        console.log('提取后解析结果:', namesData);
        
        // 验证返回的数据格式
        if (Array.isArray(namesData) && namesData.length > 0) {
          setNameResults(namesData);
        } else if (typeof namesData === 'object' && namesData !== null) {
          // 如果是对象而不是数组，尝试转换为数组格式
          const keys = Object.keys(namesData);
          if (keys.length > 0) {
            // 检查是否有名字列表字段
            if (Array.isArray(namesData.names) && namesData.names.length > 0) {
              setNameResults(namesData.names);
            } else {
              // 尝试将对象转换为数组
              const resultsArray = [];
              for (const key of keys) {
                if (typeof namesData[key] === 'object' && 
                    namesData[key].chineseName) {
                  resultsArray.push(namesData[key]);
                }
              }
              if (resultsArray.length > 0) {
                setNameResults(resultsArray);
              } else {
                throw new Error('API返回的数据格式不正确，无法转换为有效数组');
              }
            }
          } else {
            throw new Error('API返回的是空对象');
          }
        } else {
          throw new Error('API返回的数据格式不正确');
        }
      } catch (jsonError: unknown) {
        console.error('JSON解析失败:', jsonError);
        throw new Error(`JSON解析错误: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      }
    } catch (err) {
      console.error('生成名字出错:', err);
      setError(err instanceof Error ? err.message : '生成名字时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>新生儿智能起名系统</h1>
        <p className="subtitle">结合中国文化，为您的宝宝起一个有意义的名字</p>
      </header>
      
      <main>
        <section className="form-section">
          <h2>父母信息</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fatherName">父亲姓名</label>
              <input
                id="fatherName"
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="请输入父亲姓名"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="motherName">母亲姓名</label>
              <input
                id="motherName"
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="请输入母亲姓名"
              />
            </div>
            

          </div>
          
          <h2>宝宝信息</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="babyGender">宝宝性别</label>
              <select
                id="babyGender"
                value={babyGender}
                onChange={(e) => setBabyGender(e.target.value)}
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
          
          <h2>名字定制选项</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nameLength">名字长度（汉字）</label>
              <select
                id="nameLength"
                value={nameLength}
                onChange={(e) => setNameLength(Number(e.target.value))}
              >
                <option value={2}>2个字</option>
                <option value={3}>3个字</option>
                <option value={4}>4个字</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="customCharacter">定制字（选填）</label>
              <input
                id="customCharacter"
                type="text"
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
                placeholder="请输入要包含的字"
                maxLength={1}
              />
            </div>
          </div>
          
          {customCharacter && (
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label htmlFor="isGeneration">
                  <input
                    id="isGeneration"
                    type="checkbox"
                    checked={isGeneration}
                    onChange={(e) => setIsGeneration(e.target.checked)}
                  />
                  定制字是辈份字（必须放在第二个位置）
                </label>
              </div>
            </div>
          )}
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="parentMessage">父母寄语（选填）</label>
              <textarea
                id="parentMessage"
                value={parentMessage}
                onChange={(e) => setParentMessage(e.target.value)}
                placeholder="请输入您对宝宝的期望或寄语，例如：健康快乐、聪明伶俐、品德高尚等"
                rows={3}
                maxLength={200}
              />
              <small className="char-count">{parentMessage.length}/200</small>
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="extraRules">额外起名规则（选填）</label>
              <textarea
                id="extraRules"
                value={extraRules}
                onChange={(e) => setExtraRules(e.target.value)}
                placeholder="请输入您希望遵循的额外起名规则，例如：避免生僻字、名字有出处典故等"
                rows={3}
                maxLength={200}
              />
              <small className="char-count">{extraRules.length}/200</small>
            </div>
          </div>
          
          <button 
            className="generate-btn"
            onClick={generateNames}
            disabled={isLoading}
          >
            {isLoading ? '生成中...' : '生成名字'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
        </section>
        
        <section className="results-section">
          <h2>推荐名字</h2>
          {nameResults.length > 0 ? (
            <div className="name-cards">
              {nameResults.map((nameResult, index) => (
                <div key={index} className="name-card">
                  <h3>{nameResult.chineseName}</h3>
                  <div className="meaning-section">
                    <p className="chinese-meaning"><strong>寓意解析：</strong>{nameResult.chineseMeaning}</p>
                    <p className="five-elements-analysis"><strong>五行分析：</strong>{nameResult.fiveElementsAnalysis}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">请填写信息并点击"生成名字"按钮</p>
          )}
        </section>
      </main>
      
      <footer>
        <p>© 2024 新生儿智能起名系统 - 结合中国传统文化的智能命名服务</p>
      </footer>
    </div>
  );
}

export default App;
