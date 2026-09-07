import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { defaultTheme } from '../src/theme.js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const tokens = read('src/tokens.css')
const components = read('src/components.css')

describe('el tema no depende de ningun framework ajeno', () => {
    /**
     * Los paquetes usaban 305 clases de UIkit y 551 de Tailwind sin declarar
     * ninguno de los dos como dependencia: eran globales implicitas del
     * anfitrion, el mismo defecto que inputClass y buttonClass.
     */
    it('ningun token trae clases de UIkit, Tailwind ni Font Awesome', () => {
        const ajenas = Object.entries(defaultTheme).filter(([, value]) =>
            /\buk-|\bfa-|\bdark:|\b(?:text|bg|border|flex|font|ml|mb|px|py)-/.test(value)
        )

        expect(ajenas).toEqual([])
    })

    it('cada token apunta a una clase del sistema propio', () => {
        const fuera = Object.entries(defaultTheme).filter(
            ([, value]) => ! value.split(' ').every((cls) => cls.startsWith('fe-'))
        )

        expect(fuera).toEqual([])
    })

    it('cada clase de cada token existe en la hoja de estilos', () => {
        const faltan = Object.entries(defaultTheme)
            .flatMap(([token, value]) => value.split(' ').map((cls) => [token, cls]))
            .filter(([, cls]) => ! components.includes(`.${cls}`))

        expect(faltan).toEqual([])
    })
})

describe('las primitivas', () => {
    it('definen el tema claro completo en :root', () => {
        // Un color cuya unica definicion viva dentro de una media query no
        // aplica en el estado por defecto, y esa es la forma clasica de que un
        // tema salga ilegible.
        const usadas = [...components.matchAll(/var\((--fe-[a-z0-9-]+)/g)].map((m) => m[1])
        const raiz = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('@media'))

        const huerfanas = [...new Set(usadas)].filter((name) => ! raiz.includes(`${name}:`))

        expect(huerfanas).toEqual([])
    })

    it('el modo oscuro redefine solo colores y sombras, no la forma', () => {
        // Solo los dos bloques de tema oscuro: `.fe-dense`, que viene despues,
        // si redefine la densidad y debe hacerlo.
        const oscuro = tokens.slice(
            tokens.indexOf('@media (prefers-color-scheme: dark)'),
            tokens.indexOf('.fe-dense')
        )
        const redefinidas = [...oscuro.matchAll(/(--fe-[a-z0-9-]+):/g)].map((m) => m[1])

        const forma = redefinidas.filter((name) => /radius|space|text-(xs|sm|base|lg|xl)|font|density|control/.test(name))

        expect(forma).toEqual([])
    })

    it('la eleccion explicita de tema claro gana sobre un sistema en oscuro', () => {
        expect(tokens).toContain(":root:not([data-theme='light'])")
    })

    it('el interruptor a oscuro gana en la otra direccion', () => {
        expect(tokens).toContain(":root[data-theme='dark']")
    })

    it('la densidad es una variable, no un juego de clases por componente', () => {
        expect(tokens).toContain('--fe-density')
        expect(tokens).toContain('--fe-control-height: calc(2.25rem * var(--fe-density))')
    })
})

describe('accesibilidad de serie', () => {
    it('los controles tienen un estado de foco visible', () => {
        expect(components).toMatch(/\.fe-input:focus/)
        expect(components).toMatch(/\.fe-button:focus-visible/)
    })

    it('respeta prefers-reduced-motion', () => {
        expect(components).toContain('@media (prefers-reduced-motion: reduce)')
    })
})
