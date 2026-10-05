import { countTokens as countO200k } from 'gpt-tokenizer'

/** Token count using o200k_base (GPT-4o/GPT-5). Other providers are approximated from it. */
export function countTokens(text: string): number {
  return text ? countO200k(text) : 0
}
