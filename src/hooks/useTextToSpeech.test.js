import { renderHook, act } from '@testing-library/react-hooks';
import useTextToSpeech from './useTextToSpeech';
import configLoader from '../utils/configLoader';

// Mock ConfigLoader
jest.mock('../utils/configLoader', () => ({
    getConfig: jest.fn().mockReturnValue({
        apiKeys: { sarvam: 'test-sarvam-key' },
        voice: { languageCode: 'en-IN', voiceName: 'sarvam:en:female' }
    })
}));

describe('useTextToSpeech', () => {
    let mockFetch;
    let mockAudio;

    beforeEach(() => {
        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock Audio
        mockAudio = {
            play: jest.fn().mockResolvedValue(),
            pause: jest.fn(),
            load: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(), // Missing method added
            style: {},
            src: '',
            onended: null,
            onerror: null
        };
        global.Audio = jest.fn(() => mockAudio);

        // Mock document.body.appendChild
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn(); // Usually needed for cleanup
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('speak should call Sarvam API with correct parameters', async () => {
        const { result } = renderHook(() => useTextToSpeech());

        // Mock successful response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ audio_content: 'base64audio' })
        });

        await act(async () => {
            await result.current.speak('Hello Sarvam');
        });

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.sarvam.ai/v1/text-to-speech',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-sarvam-key'
                }),
                body: JSON.stringify({
                    text: 'Hello Sarvam',
                    language_code: 'en-IN',
                    speaker_id: 'sarvam:en:female',
                    pitch: 0,
                    speaking_rate: 1.0
                })
            })
        );
    });

    test('speak should handle API errors', async () => {
        const { result } = renderHook(() => useTextToSpeech());

        mockFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Server Error',
            json: async () => ({ message: 'API Error' })
        });

        await act(async () => {
            try {
                await result.current.speak('Fail please');
            } catch (e) {
                expect(e.message).toContain('Sarvam TTS API error');
            }
        });

        expect(result.current.error).toBeTruthy();
    });
});
