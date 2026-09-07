# Reglas del Agente — Proyecto Flor

## Skills obligatorias en cada petición

Antes de ejecutar **cualquier tarea** en este workspace, el agente DEBE:

1. Leer el SKILL.md de las skills relevantes usando `view_file` con `IsSkillFile: true`:
   - `frontend-design` → para cualquier decisión visual (color, tipografía, layout, copy, motion, accesibilidad visual).
   - `ui-ux-pro-max` → para cualquier cambio de estructura UI, componentes, interacción, responsive o animación.

2. Aplicar las guías de ambas skills al ejecutar el cambio, sin excepción, aunque la tarea sea simple
   (actualizar un dato, corregir un texto, ajustar estilos menores).

3. No omitir este paso bajo ninguna circunstancia.

Esta regla aplica a todas las peticiones del usuario en este proyecto.
