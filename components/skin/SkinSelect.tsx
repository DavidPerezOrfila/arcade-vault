'use client';

import { useSkin } from '@/components/skin/SkinProvider';
import { SKIN_IDS, SKIN_LABELS, type SkinId } from '@/lib/games/skins';

// Selector de skin reutilizable para las páginas de juego. classPrefix sigue
// la convención de AuthPrompt/LeaderboardList: cada juego estila su propia barra.
export function SkinSelect({ classPrefix }: { classPrefix: string }) {
  const { skin, setSkin } = useSkin();
  return (
    <div className={`${classPrefix}-skin-bar`}>
      <label className={`${classPrefix}-skin-select`}>
        <span>SKIN</span>
        <select
          value={skin}
          onChange={(event) => setSkin(event.target.value as SkinId)}
          aria-label='Seleccionar skin'
        >
          {SKIN_IDS.map((id) => (
            <option key={id} value={id}>
              {SKIN_LABELS[id]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
