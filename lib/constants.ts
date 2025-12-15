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

/**
 * Default Live API model to use
 */
export const DEFAULT_LIVE_API_MODEL =
  'gemini-2.5-flash-native-audio-preview-09-2025';

export const DEFAULT_VOICE = 'Aoede';

export const AVAILABLE_VOICES = ['Aoede', 'Orus', 'Zephyr', 'Puck', 'Charon', 'Luna', 'Nova', 'Kore', 'Fenrir',	'Leda', 'Callirrhoe','Autonoe','Enceladus','Iapetus','Umbriel','Algieba','Despina','Erinome','Algenib','Rasalgethi','Laomedeia','Achernar','Alnilam','Schedar','Gacrux','Pulcherrima','Achird',	'Zubenelgenubi','Vindemiatrix','Sadachbia','Sadaltager','Sulafat'];

export const DEFAULT_SESSION_ID = 'demo-session-v1';

export const SUPPORTED_LANGUAGES = [
  { label: 'English', code: 'en', locale: 'en-US' },
  { label: 'Spanish', code: 'es', locale: 'es-MX' },
  { label: 'French', code: 'fr', locale: 'fr-FR' },
  { label: 'German', code: 'de', locale: 'de-DE' },
  { label: 'Portuguese', code: 'pt', locale: 'pt-BR' },
  { label: 'Chinese', code: 'zh', locale: 'zh-CN' },
  { label: 'Japanese', code: 'ja', locale: 'ja-JP' },
  { label: 'Korean', code: 'ko', locale: 'ko-KR' },
  { label: 'Hindi', code: 'hi', locale: 'hi-IN' },
  { label: 'Turkish', code: 'tr', locale: 'tr-TR' },
  { label: 'Russian', code: 'ru', locale: 'ru-RU' },
  { label: 'Arabic', code: 'ar', locale: 'ar-SA' },
];