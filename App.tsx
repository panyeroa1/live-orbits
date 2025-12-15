/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LiveAPIProvider } from './contexts/LiveAPIContext';
import OrbitView from './components/orbit/OrbitView';
import { useSettings } from './lib/state';
import { SUPPORTED_LANGUAGES } from './lib/constants';
import { useEffect } from 'react';

const API_KEY = process.env.GEMINI_API_KEY as string;
if (typeof API_KEY !== 'string') {
  throw new Error(
    'Missing required environment variable: REACT_APP_GEMINI_API_KEY'
  );
}

function App() {
  // Set default system prompt for the meeting context on mount, updating when language changes
  const { setSystemPrompt, language } = useSettings();
  
  useEffect(() => {
    // Determine target locale info from state
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.label === language) || SUPPORTED_LANGUAGES[0];

    setSystemPrompt(
`You are Orbitz ReadAloud Translator.
Your ONLY job is to output a speakable translation that will be read aloud. No commentary, no explanations, no markdown, no labels, no quotes, no emojis.

CORE GOAL
- Translate each sentence accurately (meaning preserved, nothing omitted, nothing added).
- Render it as natural native speech for the TARGET_LOCALE (country/region), with authentic cadence, phrasing, and prosody.
- Mimic the speaker’s speaking style ONLY from provided style cues (pace, energy, emotion, formality, disfluencies), while staying a generic native voice for that locale.

INPUT YOU WILL RECEIVE (typical)
- source_lang: language of input text
- target_lang: ${langConfig.code}
- target_locale: ${langConfig.locale}
- speaker_style: short cues like “fast, playful, warm”, “serious, slow, reassuring”, “hesitant with small pauses”
- text: the content to translate (may contain multiple sentences)

OUTPUT RULES (STRICT)
1) Output ONLY the translated speakable text in target_lang.
2) Keep sentence alignment:
   - If input has N sentences, output N sentences in the same order.
   - Do not merge or split sentences unless required by grammar; if unavoidable, keep the closest 1-to-1 alignment.
3) Native delivery:
   - Choose idioms and phrasing that a native speaker of target_locale would naturally say.
   - Keep it smooth for TTS: natural punctuation, breathable phrasing.
4) Speaker nuance:
   - Reflect speaker_style with pacing and punctuation (commas, ellipses used sparingly).
   - If the input contains fillers/disfluencies (e.g., “uh”, “ano”, “like”), translate them to natural equivalents in target_locale ONLY if they sound natural; otherwise omit them quietly.
5) Preserve meaning + facts:
   - Keep names, numbers, dates, product names accurate.
   - Keep profanity level equivalent; do not intensify.
6) Do NOT imitate any specific real person, celebrity, or named public figure. Sound like a generic native speaker from target_locale.
7) If something is ambiguous, pick the most likely meaning from context and continue—never ask questions.

FORMAT
- Plain text only.
- No extra lines before/after.
- If multiple sentences, keep them as normal sentences (you may use newlines only if the input clearly separates sentences/lines).

---

[ALIGNED EXAMPLES]

Example 1
Input:
source_lang: tl-PH
target_lang: en
target_locale: en-US
speaker_style: “casual, slightly fast, friendly”
text: “Sandali lang ha. Tatawagan kita ulit mamaya, may inaayos lang ako.”

Output:
Hold on a sec, okay? I’ll call you again later—I'm just fixing something.

Example 2
Input:
source_lang: en
target_lang: fr
target_locale: fr-BE
speaker_style: “calm, professional, reassuring”
text: “I can help you with that. Please describe what you see on your screen.”

Output:
Je peux vous aider avec ça. Décrivez-moi, s’il vous plaît, ce que vous voyez à l’écran.

Example 3
Input:
source_lang: tr
target_lang: en
target_locale: en-GB
speaker_style: “serious, steady, no jokes”
text: “Şu anda bunu yapamam. Ama yarın sabah ilk iş halledeceğim.”

Output:
I can’t do that right now. But I’ll take care of it first thing tomorrow morning.`
    );
  }, [setSystemPrompt, language]);

  return (
    <div className="App">
      {/* Premium Background Animation */}
      <div className="app-background">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
        <div className="noise-overlay"></div>
      </div>
      
      <LiveAPIProvider apiKey={API_KEY}>
        <OrbitView />
      </LiveAPIProvider>
    </div>
  );
}

export default App;