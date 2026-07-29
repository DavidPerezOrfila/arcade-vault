# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: salon.spec.ts >> Salón de la Fama (/salon) >> estado vacío sin puntuaciones
- Location: tests\e2e\salon.spec.ts:26:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - link "ARCADE VAULT" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: ARCADE VAULT
    - generic [ref=e7]:
      - link "INICIO" [ref=e8] [cursor=pointer]:
        - /url: /
      - link "BIBLIOTECA" [ref=e9] [cursor=pointer]:
        - /url: /games
      - link "SALÓN" [ref=e10] [cursor=pointer]:
        - /url: /salon
      - link "ACERCA DE" [ref=e11] [cursor=pointer]:
        - /url: /about
    - generic [ref=e14]: CRÉDITOS · 03
    - link "Iniciar Sesión" [ref=e15] [cursor=pointer]:
      - /url: /auth
  - complementary [ref=e16]:
    - generic [ref=e17]: MENÚ
    - link "Inicio" [ref=e18] [cursor=pointer]:
      - /url: /
    - link "Biblioteca" [ref=e19] [cursor=pointer]:
      - /url: /games
    - link "Salón de la Fama" [ref=e20] [cursor=pointer]:
      - /url: /salon
    - link "Acerca de" [ref=e21] [cursor=pointer]:
      - /url: /about
    - link "Iniciar Sesión" [ref=e22] [cursor=pointer]:
      - /url: /auth
    - generic [ref=e24]: CRÉDITOS · 03
  - generic [ref=e25]:
    - generic [ref=e26]:
      - heading "SALÓN DE LA FAMA" [level=1] [ref=e27]
      - paragraph [ref=e28]: LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
    - generic [ref=e29]: ▸ CARGANDO...
    - link "VOLVER A LA BIBLIOTECA" [ref=e31] [cursor=pointer]:
      - /url: /
  - contentinfo [ref=e32]: © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
```