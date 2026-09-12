// Thin wrapper around window.puter (loaded via <script src="https://js.puter.com/v2/">
// in index.html). Puter handles the OAuth sign-in popup and proxies chat
// requests to each provider's free tier - no API keys needed on our side.

export const FREE_MODELS = [
  { id: 'openai/gpt-6-astra', label: 'GPT-6 Astra', tag: 'Best' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', tag: 'Free' },
  { id: 'openai/gpt-4o', label: 'ChatGPT GPT-4o', tag: 'Free' },
  { id: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash', tag: 'Free' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3', tag: 'Free' },
]

function sdk() {
  if (!window.puter) throw new Error('Puter SDK did not load - check your internet connection')
  return window.puter
}

export async function isSignedIn() {
  try { return await sdk().auth.isSignedIn() } catch { return false }
}

export async function getUser() {
  const u = await sdk().auth.getUser()
  return { username: u?.username, email: u?.email }
}

export async function signIn() {
  await sdk().auth.signIn()
  return getUser()
}

export async function signOut() {
  try { await sdk().auth.signOut() } catch { /* ignore */ }
}

export async function chat(messages, model) {
  const puter = sdk()
  let res
  try {
    res = await puter.ai.chat(messages, { model })
  } catch {
    // Some Puter versions want a single prompt string instead of a
    // messages array for certain models - fall back to that shape.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    res = await puter.ai.chat(lastUser?.content ?? '', { model })
  }
  if (typeof res === 'string') return res
  return res?.message?.content ?? res?.content ?? JSON.stringify(res)
}
