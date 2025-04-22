'use server';
/**
 * @fileOverview Manages the conversation context for the chatbot.
 *
 * - manageConversationContext - A function that handles the conversation context.
 * - ManageConversationContextInput - The input type for the manageConversationContext function.
 * - ManageConversationContextOutput - The return type for the manageConversationContext function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ManageConversationContextInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type ManageConversationContextInput = z.infer<typeof ManageConversationContextInputSchema>;

const ManageConversationContextOutputSchema = z.object({
  botResponse: z.string().describe('The response from the bot.'),
  updatedConversationHistory: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).describe('The updated history of the conversation.'),
});
export type ManageConversationContextOutput = z.infer<typeof ManageConversationContextOutputSchema>;

export async function manageConversationContext(input: ManageConversationContextInput): Promise<ManageConversationContextOutput> {
  return manageConversationContextFlow(input);
}

const conversationPrompt = ai.definePrompt({
  name: 'conversationPrompt',
  input: {
    schema: z.object({
      userInput: z.string().describe('The user input message.'),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'bot']),
        content: z.string(),
      })).optional().describe('The history of the conversation.'),
    }),
  },
  output: {
    schema: z.object({
      botResponse: z.string().describe('The response from the bot.'),
    }),
  },
  prompt: `You are a helpful chatbot. Respond to the user input based on the conversation history.

Conversation History:
{{#each conversationHistory}}
{{this.role}}: {{this.content}}
{{/each}}

User Input: {{{userInput}}}

Bot Response:`, // Removed the Jinja templating and used Handlebars
});

const manageConversationContextFlow = ai.defineFlow<
  typeof ManageConversationContextInputSchema,
  typeof ManageConversationContextOutputSchema
>({
  name: 'manageConversationContextFlow',
  inputSchema: ManageConversationContextInputSchema,
  outputSchema: ManageConversationContextOutputSchema,
}, async input => {
  const {
    userInput,
    conversationHistory = [],
  } = input;

  const {output} = await conversationPrompt({
    userInput,
    conversationHistory,
  });

  const botResponse = output!.botResponse;
  const updatedConversationHistory = [
    ...conversationHistory,
    {role: 'user', content: userInput},
    {role: 'bot', content: botResponse},
  ];

  return {
    botResponse: botResponse,
    updatedConversationHistory: updatedConversationHistory,
  };
});

