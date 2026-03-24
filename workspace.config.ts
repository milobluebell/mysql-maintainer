import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env', override: false });

export default {
  modelName: 'Pro/zai-org/GLM-5',
  apiKey: process.env.LLM_API_KEY?.trim() || undefined,
  apiBaseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  codeReviewDir: 'agents-workspace/code-review',
  patternsDir: 'agents-workspace/patterns',
  metricsDir: 'agents-workspace/metrics',
  rulesDir: '.cursor/rules',
  proposalsDir: '.cursor/rule-proposals',
  businessCodeFilePatterns: [/\.(?:ts|js)$/i],
  projectConfigFilePatterns: [/(^|\/)package\.json$/i, /(^|\/)tsconfig(?:\..+)?\.json$/i],
  postCommitReviewMaxRuntimeMs: 10 * 60 * 1000,
};
