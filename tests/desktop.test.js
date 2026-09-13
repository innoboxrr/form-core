import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const components = read('src/components.css')
const tokens = read('src/tokens.css')

/**
 * El cuerpo de la primera regla cuyo selector es exactamente este.
 */
const rule = (selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = components.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`))

    return match ? match[1] : null
}

describe('dialogos y drawers sobre <dialog>', () => {
    /**
     * Un <dialog> cerrado está oculto porque el navegador le pone
     * display: none. Una regla base que fijara display lo dejaría visible
     * siempre, abierto o no.
     */
    it('la regla base no fija display: un dialogo cerrado sigue oculto', () => {
        for (const selector of ['.fe-dialog', '.fe-drawer']) {
            expect(rule(selector), `falta la regla ${selector}`).not.toBeNull()
            expect(rule(selector)).not.toMatch(/display\s*:/)
        }
    })

    it('abierto se maqueta en columna', () => {
        expect(rule('.fe-dialog[open]')).toMatch(/display:\s*flex/)
        expect(rule('.fe-drawer[open]')).toMatch(/display:\s*flex/)
    })

    it('el fondo usa el token del overlay, que el modo oscuro redefine', () => {
        expect(components).toMatch(/::backdrop[^{]*\{[^}]*var\(--fe-overlay\)/)
        expect(tokens.slice(tokens.indexOf('@media'))).toContain('--fe-overlay:')
    })
})

describe('capas', () => {
    /**
     * Cada componente elegía su número —60 el tooltip, 1015 el select de
     * React— y el orden entre ellos no lo decidía nadie.
     */
    it('ningun z-index es un numero suelto', () => {
        const sueltos = [...components.matchAll(/z-index:\s*([^;]+);/g)]
            .map((m) => m[1].trim())
            .filter((value) => ! value.startsWith('var(--fe-z-'))

        expect(sueltos).toEqual([])
    })

    /**
     * Un aviso que llega con un drawer abierto con showModal() quedaría debajo
     * del fondo inerte si no viviera también en la capa superior.
     */
    it('la region de avisos puede vivir en la capa superior', () => {
        expect(rule('.fe-toast-region[popover]')).not.toBeNull()
    })
})

describe('movimiento', () => {
    const animaciones = [...components.matchAll(/animation(?:-name)?:\s*([a-z0-9-]+)/g)]
        .map((m) => m[1])
        .filter((name) => name !== 'none')

    /**
     * El menú usaba una animación definida en layout.css: quien importara solo
     * components.css se quedaba sin ella, sin ningún aviso.
     */
    it('cada animacion se define en la misma hoja que la usa', () => {
        const faltan = [...new Set(animaciones)].filter((name) => ! components.includes(`@keyframes ${name}`))

        expect(faltan).toEqual([])
    })

    it('prefers-reduced-motion apaga lo que se abre y lo que avisa', () => {
        const reducido = components.slice(components.lastIndexOf('@media (prefers-reduced-motion: reduce)'))

        for (const selector of ['.fe-dialog[open]', '.fe-drawer[open]', '.fe-menu[popover]:popover-open', '.fe-toast']) {
            expect(reducido, `no se apaga la animacion de ${selector}`).toContain(selector)
        }
    })
})
