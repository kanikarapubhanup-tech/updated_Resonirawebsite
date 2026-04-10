import { renderHook, act } from '@testing-library/react-hooks';
import useStreamingSTT from './useStreamingSTT';
import configLoader from '../utils/configLoader';

// Mock ConfigLoader
jest.mock('../utils/configLoader', () => ({
    getConfig: jest.fn().mockReturnValue({
        apiKeys: { sarvam: 'test-sarvam-key' },
        speech: { languageCode: 'en-IN', model: 'saaras:v1' }
    })
}));

describe('useStreamingSTT', () => {
    let mockWebSocket;
    let mockMediaRecorder;

    beforeEach(() => {
        // Mock WebSocket
        mockWebSocket = {
            send: jest.fn(),
            close: jest.fn(),
            readyState: WebSocket.OPEN,
        };
        global.WebSocket = jest.fn(() => mockWebSocket);
        global.WebSocket.OPEN = 1;

        // Mock MediaRecorder
        mockMediaRecorder = {
            start: jest.fn(),
            stop: jest.fn(),
            ondataavailable: null,
            state: 'inactive'
        };
        global.MediaRecorder = jest.fn(() => mockMediaRecorder);

        // Mock AudioContext
        global.AudioContext = jest.fn().mockImplementation(() => ({
            close: jest.fn(),
            state: 'running'
        }));

        // Mock navigator.mediaDevices.getUserMedia
        global.navigator.mediaDevices = {
            getUserMedia: jest.fn().mockResolvedValue({
                getTracks: () => [{ stop: jest.fn() }]
            })
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with default state', () => {
        const { result } = renderHook(() => useStreamingSTT());

        expect(result.current.isStreaming).toBe(false);
        expect(result.current.partialTranscript).toBe('');
        expect(result.current.finalTranscript).toBe('');
        expect(result.current.error).toBeNull();
    });

    test('startStreaming should connect to Sarvam WebSocket with correct URL', async () => {
        const { result } = renderHook(() => useStreamingSTT());

        await act(async () => {
            await result.current.startStreaming();
        });

        // Check if WebSocket was instantiated with Sarvam URL
        expect(global.WebSocket).toHaveBeenCalledWith(
            expect.stringContaining('wss://api.sarvam.ai/v1/streaming?token=test-sarvam-key')
        );
    });

    test('should handle incoming transcript messages', async () => {
        const onTranscript = jest.fn();
        const { result } = renderHook(() => useStreamingSTT());

        await act(async () => {
            await result.current.startStreaming(onTranscript);
        });

        // Simulate WebSocket open
        await act(async () => {
            mockWebSocket.onopen();
        });

        // Simulate incoming final transcript
        const mockMessage = {
            data: JSON.stringify({
                type: 'transcript',
                is_final: true,
                transcript: 'Hello world'
            })
        };

        act(() => {
            mockWebSocket.onmessage(mockMessage);
        });

        expect(result.current.finalTranscript).toBe('Hello world');
        expect(onTranscript).toHaveBeenCalledWith('Hello world');
    });

    test('stopStreaming should close resources', async () => {
        const { result } = renderHook(() => useStreamingSTT());

        await act(async () => {
            await result.current.startStreaming();
        });

        act(() => {
            result.current.stopStreaming();
        });

        expect(mockWebSocket.close).toHaveBeenCalled();
        expect(mockMediaRecorder.stop).toHaveBeenCalled();
        expect(result.current.isStreaming).toBe(false);
    });
});
