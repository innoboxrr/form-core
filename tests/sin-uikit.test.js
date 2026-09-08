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
 * Este test revisa lo que tenga a mano. En CI solo esta clonado este
 * repositorio, asi que cubre form-core; trabajando en el monorepo cubre
 * ademas los otros cuatro paquetes. Se dice en voz alta cual de los dos casos
 * es, porque una comprobacion que en realidad no mira nada siempre pasa.
 *
 * Se saltan los comentarios: explicar de que se viene no es depender de ello.
 */

const npm = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))))

const HERMANOS = ['form-elements', 'react-form-elements', 'vue-datatable', 'react-datatable']

/** Quita comentarios de bloque, de linea y de plantilla HTML. */
const sinComentarios = (source) =>
    source
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')

const recorrer = (dir, encontrados = []) => {
    if (! fs.existsSync(dir)) {
        return encontrados
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            recorrer(full, encontrados)
        } else if (/\.(vue|jsx|js|css)$/.test(entry.name)) {
            encontrados.push(full)
        }
    }

    return encontrados
}

const paquetes = ['form-core', ...HERMANOS].filter((name) =>
    fs.existsSync(path.join(npm, name, 'src'))
)

const fuentes = paquetes
    .flatMap((name) => recorrer(path.join(npm, name, 'src')))
    .map((file) => [
        path.relative(npm, file).split(path.sep).join('/'),
        sinComentarios(fs.readFileSync(file, 'utf8')),
    ])

describe(`el ecosistema no depende de UIkit (revisando: ${paquetes.join(', ')})`, () => {
    it('revisa al menos este paquete', () => {
        expect(paquetes).toContain('form-core')
        expect(fuentes.length).toBeGreaterThan(4)
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
