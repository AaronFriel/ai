import {
  LanguageModelV1ImagePart,
  LanguageModelV1Message,
  LanguageModelV1Prompt,
  LanguageModelV1TextPart,
} from '@ai-sdk/provider';
import {
  convertToLanguageModelMessage,
  convertToLanguageModelPrompt,
} from './convert-to-language-model-prompt';
import { generateId } from '@ai-sdk/provider-utils';

describe('convertToLanguageModelPrompt', () => {
  describe('user message', () => {
    describe('image parts', () => {
      it('should download images for user image parts with URLs when model does not support image URLs', async () => {
        const result = await convertToLanguageModelPrompt({
          prompt: {
            type: 'messages',
            prompt: undefined,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    image: new URL('https://example.com/image.png'),
                  },
                ],
              },
            ],
          },
          modelSupportsImageUrls: false,
          downloadImplementation: async ({ url }) => {
            expect(url).toEqual(new URL('https://example.com/image.png'));
            return {
              data: new Uint8Array([0, 1, 2, 3]),
              mimeType: 'image/png',
            };
          },
        });

        expect(result).toEqual([
          {
            role: 'user',
            content: [
              {
                type: 'image',
                mimeType: 'image/png',
                image: new Uint8Array([0, 1, 2, 3]),
              },
            ],
          },
        ] satisfies LanguageModelV1Prompt);
      });

      it('should download images for user image parts with string URLs when model does not support image URLs', async () => {
        const result = await convertToLanguageModelPrompt({
          prompt: {
            type: 'messages',
            prompt: undefined,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    image: 'https://example.com/image.png',
                  },
                ],
              },
            ],
          },
          modelSupportsImageUrls: false,
          downloadImplementation: async ({ url }) => {
            expect(url).toEqual(new URL('https://example.com/image.png'));
            return {
              data: new Uint8Array([0, 1, 2, 3]),
              mimeType: 'image/png',
            };
          },
        });

        expect(result).toEqual([
          {
            role: 'user',
            content: [
              {
                type: 'image',
                mimeType: 'image/png',
                image: new Uint8Array([0, 1, 2, 3]),
              },
            ],
          },
        ]);
      });
    });

    describe('provider metadata', () => {
      it('should pass through provider metadata', async () => {
        const providerName = generateId();
        const key = generateId();
        const value = generateId();

        const result = await convertToLanguageModelPrompt({
          prompt: {
            type: 'messages',
            prompt: undefined,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'hello, world!',
                    experimental_providerMetadata: {
                      [providerName]: {
                        name: 'foo',
                        [key]: value,
                      },
                    },
                  },
                ],
              },
            ],
          },
          modelSupportsImageUrls: undefined,
        });

        expect(result).toEqual([
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'hello, world!',
                providerMetadata: {
                  [providerName]: {
                    name: 'foo',
                    [key]: value,
                  },
                },
              },
            ],
          },
        ] satisfies LanguageModelV1Prompt);
      });

      it('should pass through provider metadata at the message level', async () => {
        const providerName = generateId();
        const key = generateId();
        const value = generateId();

        const result = await convertToLanguageModelPrompt({
          prompt: {
            type: 'messages',
            prompt: undefined,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'hello, world!',
                  },
                ],
                experimental_providerMetadata: {
                  [providerName]: {
                    name: 'foo',
                    [key]: value,
                  },
                },
              },
            ],
          },
          modelSupportsImageUrls: undefined,
        });

        expect(result).toEqual([
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'hello, world!',
              },
            ],
          },
        ] satisfies LanguageModelV1Prompt);
      });
    });
  });
});

describe('convertToLanguageModelMessage', () => {
  describe('user message', () => {
    describe('image parts', () => {
      it('should convert image string https url to URL object', async () => {
        const result = convertToLanguageModelMessage(
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: 'https://example.com/image.jpg',
              },
            ],
          },
          null,
        );

        expect(result).toEqual({
          role: 'user',
          content: [
            {
              type: 'image',
              image: new URL('https://example.com/image.jpg'),
            },
          ],
        });
      });

      it('should convert image string data url to base64 content', async () => {
        const result = convertToLanguageModelMessage(
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: 'data:image/jpg;base64,dGVzdA==',
              },
            ],
          },
          null,
        );

        expect(result).toEqual({
          role: 'user',
          content: [
            {
              type: 'image',
              image: new Uint8Array([116, 101, 115, 116]),
              mimeType: 'image/jpg',
            },
          ],
        });
      });
    });
  });

  describe('assistant message', () => {
    describe('text parts', () => {
      it('should ignore empty text parts', async () => {
        const result = convertToLanguageModelMessage(
          {
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: '',
              },
              {
                type: 'tool-call',
                toolName: 'toolName',
                toolCallId: 'toolCallId',
                args: {},
              },
            ],
          },
          null,
        );

        expect(result).toEqual({
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              args: {},
              toolCallId: 'toolCallId',
              toolName: 'toolName',
            },
          ],
        });
      });
    });
  });
});
