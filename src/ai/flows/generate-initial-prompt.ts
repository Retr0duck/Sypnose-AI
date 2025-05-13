'use server';

/**
 * @fileOverview A flow to generate an initial prompt for the user to start a conversation.
 *
 * - generateInitialPrompt - A function that generates an initial prompt.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function.
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({
  topic: z.string().describe('The topic for the initial prompt.'),
});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  initialPrompt: z.string().describe('The generated initial prompt.'),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow(input);
}

const initialPromptPrompt = ai.definePrompt({
  name: 'initialPromptPrompt',
  input: {schema: GenerateInitialPromptInputSchema},
  output: {schema: GenerateInitialPromptOutputSchema},
  prompt: `Generate an initial prompt for a conversation about {{topic}}.`,
});

const generateInitialPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPromptFlow',
    inputSchema: GenerateInitialPromptInputSchema,
    outputSchema: GenerateInitialPromptOutputSchema,
  },
  async (input): Promise<GenerateInitialPromptOutput> => {
    try {
      // For structured output, Genkit prompt invoker returns an object with an 'output' property.
      const result = await initialPromptPrompt(input);
      
      // The actual output from the LLM, conforming to GenerateInitialPromptOutputSchema
      const output = result.output;

      if (output && typeof output.initialPrompt === 'string') {
        return output;
      }
      
      console.error('Genkit flow "generateInitialPromptFlow" did not return the expected output structure or initialPrompt was missing/invalid. Output received:', output);
      throw new Error('AI failed to generate a valid initial prompt content.');
    } catch (error) {
      console.error('Error in generateInitialPromptFlow execution:', error);
      // Re-throw a new error to ensure it's a standard Error object and to provide context
      throw new Error(`Failed to generate initial prompt via Genkit flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);