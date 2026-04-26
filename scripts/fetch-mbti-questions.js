/**
 * MBTI 题库抓取与转换脚本
 *
 * 从 MskTmi/MBTI (GitHub) 获取 93 题中文 MBTI 题库
 * 转换为前端测试引擎所需的结构化 JSON 格式
 *
 * 用法: node scripts/fetch-mbti-questions.js
 * 输出: psychology/static/questions.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const QUESTIONS_URL = 'https://raw.githubusercontent.com/MskTmi/MBTI/master/data/questions.json';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'psychology', 'static', 'questions.json');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function transformQuestions(rawQuestions) {
  return rawQuestions.map((item, index) => {
    const id = index + 1;

    // 清理题目文本：去除多余空格和特殊字符
    const question = item.question.trim();

    // 构建选项数组
    const options = [
      {
        text: item.choice_a.text.trim(),
        score: { [item.choice_a.value]: 1 }
      },
      {
        text: item.choice_b.text.trim(),
        score: { [item.choice_b.value]: 1 }
      }
    ];

    return {
      id,
      category: 'MBTI',
      text: question,
      options
    };
  });
}

async function main() {
  console.log('正在从 GitHub 获取 MBTI 题库...');
  const rawQuestions = await fetchJson(QUESTIONS_URL);
  console.log(`获取成功: ${rawQuestions.length} 道题`);

  const transformed = transformQuestions(rawQuestions);

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  const jsonOutput = JSON.stringify(transformed, null, 2);
  fs.writeFileSync(OUTPUT_PATH, jsonOutput, 'utf-8');
  console.log(`转换完成，已输出到: ${OUTPUT_PATH}`);
  console.log(`文件大小: ${(Buffer.byteLength(jsonOutput) / 1024).toFixed(1)} KB`);

  // 输出统计信息
  const dimCount = {};
  transformed.forEach(q => {
    q.options.forEach(opt => {
      const dim = Object.keys(opt.score)[0];
      dimCount[dim] = (dimCount[dim] || 0) + 1;
    });
  });
  console.log('\n维度分布 (每个维度出现的次数):');
  Object.entries(dimCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([dim, count]) => console.log(`  ${dim}: ${count}`));
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
