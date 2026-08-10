-- Migration: 20260810_rename_rocas_to_asteroids.sql
-- Description: Sustituye el placeholder 'rocas' por 'asteroids' (juego real) en el catálogo

update public.games
set id = 'asteroids',
    title = 'ASTEROIDS',
    short = 'Pulveriza asteroides en gravedad cero.',
    long = 'Tu nave triangular flota en vacío absoluto. Dispara y rota para dividir rocas en fragmentos cada vez más pequeños. Cuidado con los OVNIs en el horizonte.',
    cover = 'cover-asteroids'
where id = 'rocas';

-- scores no tienen FK a games.id; migrar los de rocas para no perderlos
update public.scores set game = 'asteroids' where game = 'rocas';
