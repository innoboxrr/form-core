import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const components = fs.readFileSync(path.join(root, 'src/components.css'), 'utf8')

/**
 * Los diez tooltips del ecosistema son texto plano —la ayuda de un campo,
 * «This action is not authorized», «Buscar»—, asi que no necesitan
 * posicionamiento dinamico ni contenido rico. Antes los pintaba `uk-tooltip`,
 * que es un componente de UIkit: para una cadena de ayuda arrastraba un
 * framework de 12 MB.
 */
describe('el tooltip no necesita JavaScript', () => {
    it('se dibuja con CSS y no con un componente', () => {
        expect(components).toContain('[data-tooltip]::after')
        expect(components).toContain('content: attr(data-tooltip)')
    })

    /**
     * Un tooltip que solo aparece con el raton no existe para quien navega con
     * teclado.
     */
    it('aparece tambien con el foco', () => {
        expect(components).toContain('[data-tooltip]:focus-visible::after')
    })

    it('tiene las posiciones que usaba uk-tooltip', () => {
        for (const pos of ['right', 'left', 'bottom']) {
            expect(components, `falta la posicion ${pos}`).toContain(`[data-tooltip-pos='${pos}']::after`)
        }
    })

    it('un tooltip vacio no dibuja una caja', () => {
        expect(components).toContain("[data-tooltip='']::after")
    })

    it('no interfiere con el raton sobre lo que hay debajo', () => {
        const bloque = components.slice(
            components.indexOf('[data-tooltip]::after'),
            components.indexOf('[data-tooltip]:hover::after')
        )

        expect(bloque).toContain('pointer-events: none')
    })

    it('respeta prefers-reduced-motion', () => {
        const reducido = components.slice(components.indexOf('@media (prefers-reduced-motion: reduce)'))

        expect(reducido).toContain('[data-tooltip]::after')
    })
})
