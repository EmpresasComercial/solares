/**
 * useClickSound — toca um som de clique suave ao clicar em qualquer elemento interativo.
 * Funciona tanto no browser Chrome como na PWA instalada.
 */
export function initClickSound(): () => void {
  // Som de clique gerado via Web Audio API (sem ficheiro externo)
  const playClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);

      oscillator.onended = () => ctx.close();
    } catch {
      // Silencia erros silenciosamente (ex: política de autoplay)
    }
  };

  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      'button, a, [role="button"], [tabindex], input, select, label, nav a'
    );
    if (isInteractive) {
      playClick();
    }
  };

  document.addEventListener('click', handler, { passive: true });

  // Retorna função de cleanup
  return () => document.removeEventListener('click', handler);
}
