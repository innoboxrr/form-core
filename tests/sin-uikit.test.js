import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * El ecosistema usaba UIkit sin declararlo en ningun package.json: llegaba
 * como CSS y JS global de la aplicacion anfitriona, de modo que un paquete
 * solo funcionaba dentro de una app que ya lo trajera cargado, y nadie lo
 * decia. Eran 280 usos de 68 clases mas cuatro comportamientos de JavaScript.
 *
 * Este test recorre los cinco paquetes del ecosistema y falla si vuelve a
 * aparecer cualquiera de las dos cosas. Se salta los comentarios: explicar de
 * que se viene no es depender de ello.
 */

const npm = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))))

const PAQUETES = ['form-core', 'form-elements', 'react-form-elements', 'vue-datatable', 'react-datatable']

/** Quita comentarios de bloque, de linea y de plantilla HTML. */
const sinComentarios = (source) =>
    source
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')

const archivos = () => {
    const encontrados = []

    const recorrer = (dir) => {
        if (! fs.existsSync(dir)) {
            return
        }

        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                recorrer(full)
            } else if (/\.(vue|jsx|js|css)$/.test(entry.name)) {
                encontrados.push(full)
            }
        }
    }

    for (const paquete of PAQUETES) {
        recorrer(path.join(npm, paquete, 'src'))
    }

    return encontrados
}

describe('el ecosistema no depende de UIkit', () => {
    const fuentes = archivos().map((file) => [
        path.relative(npm, file).split(path.sep).join('/'),
        sinComentarios(fs.readFileSync(file, 'utf8')),
    ])

    it('encuentra los archivos que tiene que revisar', () => {
        // Una comprobación que no mira nada siempre pasa.
        expect(fuentes.length).toBeGreaterThan(50)
    })

    it('ninguna clase uk-', () => {
        const infractores = fuentes
            .filter(([, source]) => /\buk-[a-z0-9@-]+/.test(source))
            .map(([file, source]) => `${file}: ${[...new Set(source.match(/\buk-[a-z0-9@-]+/g))].join(', ')}`)

        expect(infractores).toEqual([])
    })

    it('nadie llama al JavaScript de UIkit', () => {
        const infractores = fuentes
            .filter(([, source]) => /UIkit\s*[?.(]/.test(source))
            .map(([file]) => file)

        expect(infractores).toEqual([])
    })

    it('ninguna clase de Font Awesome', () => {
        const infractores = fuentes
            .filter(([, source]) => /\bfa[srlbd]?-[a-z0-9-]+/.test(source))
            .map(([file, source]) => `${file}: ${[...new Set(source.match(/\bfa[srlbd]?-[a-z0-9-]+/g))].join(', ')}`)

        expect(infractores).toEqual([])
    })
})
