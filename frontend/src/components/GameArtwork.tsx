import React from 'react';
import { CircleDot, Gamepad2, Gauge, Orbit, Swords, Zap } from 'lucide-react';
import { Game } from '../types';

interface GameArtworkProps {
  game: Game;
  className?: string;
}

const artworkFor = (game: Game) => {
  const details = `${game.title} ${game.category_name || ''} ${game.publisher || ''}`.toLocaleLowerCase();

  if (/sport|football|course|racing|auto|gran turismo/.test(details)) {
    return { Icon: Gauge, label: 'RACE / PLAY', accent: '#ffb16c', color: '#f06a45', base: '#092e38', motif: 'racing' };
  }
  if (/credit|coin|point|v-buck|valorant|fc coins/.test(details)) {
    return { Icon: CircleDot, label: 'DIGITAL GOODS', accent: '#a7ffe1', color: '#20a992', base: '#102f3f', motif: 'digital' };
  }
  if (/rpg|elden|fantasy|red dead|adventure/.test(details)) {
    return { Icon: Orbit, label: 'OPEN WORLD', accent: '#ffe09c', color: '#aa713e', base: '#253126', motif: 'world' };
  }
  if (/gta|action|shooter|valorant/.test(details)) {
    return { Icon: Swords, label: 'ACTION / STORY', accent: '#ffa28e', color: '#c84f4c', base: '#2c1b2e', motif: 'action' };
  }
  return { Icon: Gamepad2, label: 'A2SIL SELECTION', accent: '#cfeae0', color: '#5b91a3', base: '#18283a', motif: 'classic' };
};

export const GameArtwork: React.FC<GameArtworkProps> = ({ game, className = '' }) => {
  const artwork = artworkFor(game);
  const { Icon } = artwork;

  return (
    <div
      aria-label={`Illustration stylisée de ${game.title}`}
      role="img"
      className={`relative isolate h-full min-h-0 w-full overflow-hidden ${className}`}
      style={{ backgroundColor: artwork.base }}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 25%, ${artwork.color} 0%, transparent 48%), linear-gradient(145deg, ${artwork.base} 10%, #101827 100%)` }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: artwork.motif === 'racing' ? 'repeating-linear-gradient(132deg, transparent 0 22px, rgba(255,255,255,.14) 23px 24px, transparent 25px 46px)' : 'radial-gradient(circle at 15% 80%, rgba(255,255,255,.12) 1px, transparent 1.5px)', backgroundSize: artwork.motif === 'racing' ? 'auto' : '18px 18px' }} />

      <div className="absolute -right-14 -top-16 h-64 w-64 rounded-full border" style={{ borderColor: `${artwork.accent}55`, boxShadow: `0 0 70px ${artwork.color}66` }} />
      <div className="absolute -right-4 -top-6 h-44 w-44 rounded-full border" style={{ borderColor: `${artwork.accent}66` }} />
      <div className="absolute right-8 top-8 flex h-28 w-28 items-center justify-center rounded-full border" style={{ borderColor: `${artwork.accent}88`, background: `radial-gradient(circle, ${artwork.color}88, transparent 72%)` }}>
        <Icon className="h-12 w-12" strokeWidth={1.15} style={{ color: artwork.accent, filter: `drop-shadow(0 0 18px ${artwork.color})` }} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-[70%] bg-gradient-to-t from-[#0b111b] via-[#0b111b]/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em]" style={{ color: artwork.accent }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: artwork.accent, boxShadow: `0 0 12px ${artwork.accent}` }} />
          {artwork.label}
        </div>
        <h3 className="line-clamp-2 max-w-[90%] font-dream-title text-2xl leading-tight text-white sm:text-3xl">
          {game.title}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[.12em] text-white/55">
          <span className="truncate">{game.publisher || game.category_name || 'A2SIL'}</span>
          <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: artwork.accent }} />
        </div>
      </div>
    </div>
  );
};
