// src/ai/flows/generate-initial-prompt.ts
'use server';

/**
 * @fileOverview Generates initial prompts for the chatbot to help users start the conversation.
 *
 * - generateInitialPrompt - A function that generates initial prompts.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function.
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({
  topic: z.string().optional().describe('The topic for which to generate initial prompts. If not provided, prompts will be generic.'),
});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  prompts: z.array(
    z.string().describe('An initial prompt for the user to start the conversation')
  ).describe('A list of suggested initial prompts.')
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialPromptPrompt',
  input: {
    schema: z.object({
      topic: z.string().optional().describe('The topic for which to generate initial prompts. If not provided, prompts will be generic.'),
    }),
  },
  output: {
    schema: z.object({
      prompts: z.array(
        z.string().describe('An initial prompt for the user to start the conversation')
      ).describe('A list of suggested initial prompts.'),
    }),
  },
  prompt: `You are a chatbot designed to help users get started with conversations.  Generate a list of diverse and engaging initial prompts for the user.

{{#if topic}}
The prompts should be related to the topic: {{{topic}}}.
{{/if}}

Output the prompts in JSON format.
`
});

const generateInitialPromptFlow = ai.defineFlow<
  typeof GenerateInitialPromptInputSchema,
  typeof GenerateInitialPromptOutputSchema
>(
  {
    name: 'generateInitialPromptFlow',
    inputSchema: GenerateInitialPromptInputSchema,
    outputSchema: GenerateInitialPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
