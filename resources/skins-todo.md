# Skins — cobertura por juego

Sistema global de tres skins (`clasico`, `neon`, `retro`) sobre fondos oscuros.
El selector global vive en `components/nav.tsx` y cada juego integra un
`<SkinSelect>` local; la persistencia usa `localStorage` con clave
`arcade-vault-skin` y el estado se refleja en `<html data-skin="...">`.

| Juego        | clasico | neon | retro | dark-safe | Estado    |
| ------------ | ------- | ---- | ----- | --------- | --------- |
| `asteroids`  | ✅       | ✅    | ✅     | ✅         | Completo  |
| `caida`      | —       | —    | —     | —         | Pendiente |
| `serpentina` | —       | —    | —     | —         | Pendiente |
| `bloque-buster` | ✅    | ✅    | ✅     | ✅         | Completo  |
| `ranaria`    | ✅       | ✅    | ✅     | ✅         | Completo  |

## Notas

- `asteroids`: engine consume `PALETTES` de `lib/games/skins.ts`; `clasico`
  reproduce la apariencia original (blanco sobre negro, power-up cyan).
  `retro` añade scanlines por CSS; `neon` usa colores saturados + halo sutil.
- `caida` y `serpentina`: motores aún con colores propios; pendientes de
  mapear sus entidades a los mismos tokens.
- `bloque-buster`: engine consume `PALETTES` para background, HUD y overlays
  (gameover/pausa/win). Bloques, paleta y pelota son sprites del spritesheet
  `/arkanoid-assets/spritesheet-breakout.png` (fidelidad del port), no tokens
  de paleta; `retro` añade scanlines por CSS, `neon` halo al canvas.
- `ranaria`: engine consume `PALETTES` para colores de entidades (frog=player,
  coches=enemy/bullet, troncos=thrust, tortugas=accent). CSS usa variables
  del sistema de skins; `retro` scanlines, `neon` halo al canvas.
