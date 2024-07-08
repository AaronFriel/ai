import { convertToOpenAIChatMessages } from './convert-to-openai-chat-messages';

describe('user messages', () => {
  it('should convert messages with image parts to multiple parts', async () => {
    const result = convertToOpenAIChatMessages([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          {
            type: 'image',
            image: new Uint8Array([0, 1, 2, 3]),
            mimeType: 'image/png',
          },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          {
            type: 'image_url',
            image_url: { url: 'data:image/png;base64,AAECAw==' },
          },
        ],
      },
    ]);
  });

  it('should convert messages with only a text part to a string content', async () => {
    const result = convertToOpenAIChatMessages([
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello' }],
      },
    ]);

    expect(result).toEqual([{ role: 'user', content: 'Hello' }]);
  });
});

describe('tool calls', () => {
  it('should stringify arguments to tool calls', () => {
    const result = convertToOpenAIChatMessages([
      {
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            args: { foo: 'bar123' },
            toolCallId: 'quux',
            toolName: 'thwomp',
          },
        ],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'quux',
            toolName: 'thwomp',
            result: { oof: '321rab' },
          },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            type: 'function',
            id: 'quux',
            function: {
              name: 'thwomp',
              arguments: JSON.stringify({ foo: 'bar123' }),
            },
          },
        ],
      },
      {
        role: 'tool',
        content: JSON.stringify({ oof: '321rab' }),
        tool_call_id: 'quux',
      },
    ]);
  });

  it('should convert tool calls to function calls with useLegacyFunctionCalling', () => {
    const result = convertToOpenAIChatMessages(
      [
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              args: { foo: 'bar123' },
              toolCallId: 'quux',
              toolName: 'thwomp',
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId: 'quux',
              toolName: 'thwomp',
              result: { oof: '321rab' },
            },
          ],
        },
      ],
      true /* useLegacyFunctionCalling */,
    );

    expect(result).toEqual([
      {
        role: 'assistant',
        content: '',
        function_call: {
          name: 'thwomp',
          arguments: JSON.stringify({ foo: 'bar123' }),
        },
      },
      {
        role: 'function',
        content: JSON.stringify({ oof: '321rab' }),
        name: 'thwomp',
      },
    ]);
  });
});
