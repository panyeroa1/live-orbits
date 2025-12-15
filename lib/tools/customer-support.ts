/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from '../state';

// Default tools removed for ReadAloud Translator context
export const customerSupportTools: FunctionCall[] = [];