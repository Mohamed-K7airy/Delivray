/**
 * Utility to play a simple notification beep using Web Audio API.
 * This avoids needing external assets and works in all modern browsers.
 */
export const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine'; // Soft notification sound
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);

        // Close context after play to save resources
        setTimeout(() => {
            audioCtx.close();
        }, 600);
    } catch (err) {
        console.warn('Audio feedback failed or was blocked by browser policy:', err);
    }
};
