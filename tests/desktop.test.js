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

describe('medidas', () => {
    /**
     * Visto en un navegador: sin un reset global de border-box, un .fe-input
     * con width: 100% y padding medía más que el cuerpo del drawer y le sacaba
     * una barra de desplazamiento horizontal. jsdom no mide, así que ningún test
     * de componentes lo habría visto.
     */
    it('lo que ocupa todo el ancho no depende de un reset del anfitrion', () => {
        for (const selector of ['.fe-dialog', '.fe-drawer', '.fe-command-input', '.fe-icon-button']) {
            expect(rule(selector), `${selector} sin box-sizing`).toMatch(/box-sizing:\s*border-box/)
        }

        expect(components).toMatch(/\.fe-input,\s*\.fe-select,\s*\.fe-textarea,\s*\.fe-file\s*\{[^}]*box-sizing:\s*border-box/)
    })

    /**
     * También visto en el navegador: un <li> de la paleta con width: 100% y
     * padding sacaba una barra horizontal en la lista.
     */
    it('los elementos de lista que ocupan todo el ancho tampoco se desbordan', () => {
        for (const selector of ['.fe-command-item', '.fe-menu-item']) {
            expect(rule(selector), `${selector} sin box-sizing`).toMatch(/box-sizing:\s*border-box/)
        }
    })

    /**
     * El valor editable es un <button>, y el navegador le pone fondo gris,
     * borde y su propia fuente. Tiene que leerse como el texto que muestra.
     */
    it('el valor editable no se ve como un boton del navegador', () => {
        const editable = rule('.fe-editable')

        expect(editable).toMatch(/font:\s*inherit/)
        expect(editable).toMatch(/background:\s*none/)
        expect(editable).toMatch(/border:\s*none/)
    })
})

describe('listados', () => {
    /**
     * Ordenar con el teclado exige un botón dentro del <th>. Sin reset se vería
     * como un botón del navegador en mitad de la cabecera, con otra fuente y
     * sin las mayúsculas del resto.
     */
    it('el boton de ordenar se lee como el resto de la cabecera', () => {
        const sort = rule('.fe-table-sort')

        expect(sort).toMatch(/font:\s*inherit/)
        expect(sort).toMatch(/text-transform:\s*inherit/)
        expect(sort).toMatch(/background:\s*none/)
        expect(sort).toMatch(/border:\s*none/)
    })

    it('el boton de ordenar enseña el foco', () => {
        expect(rule('.fe-table-sort:focus-visible')).toMatch(/outline:/)
    })

    /**
     * Una tabla más ancha que la pantalla ensanchaba la página entera. Se
     * desplaza su contenedor, no el documento.
     */
    it('la tabla se desplaza dentro de su contenedor', () => {
        expect(rule('.fe-table-container')).toMatch(/overflow:\s*auto/)
        expect(rule('.fe-table-container')).toMatch(/max-height:\s*var\(--fe-table-max-height/)
    })

    /**
     * .fe-select ocupa todo el ancho en un formulario; en el paginador eso
     * empujaría las flechas fuera de la línea.
     */
    it('el selector de pagina no ocupa todo el ancho', () => {
        expect(rule('.fe-table-pager .fe-select')).toMatch(/width:\s*auto/)
    })

    it('cada token del listado tiene su regla', () => {
        for (const selector of ['.fe-datatable', '.fe-datatable-filters', '.fe-table-footer', '.fe-table-pager', '.fe-toolbar-spacer']) {
            expect(rule(selector), `falta la regla ${selector}`).not.toBeNull()
        }
    })
})

describe('campos compuestos', () => {
    /**
     * FileDropInputComponent, AvatarInputComponent y CodeInputComponent de la
     * rama React ya pintaban estas clases, y ninguna hoja las definía: salían
     * sin estilo. La rama Vue las dibujaba con Tailwind, que el paquete no
     * declara.
     */
    it('cada pieza tiene su regla', () => {
        for (const selector of [
            '.fe-file-drop',
            '.fe-file-drop-hint',
            '.fe-avatar-preview',
            '.fe-code-input',
            '.fe-code-cell',
            '.fe-group',
            '.fe-group-title',
            '.fe-drag-handle',
            '.fe-icon-button-danger',
        ]) {
            expect(rule(selector), `falta la regla ${selector}`).not.toBeNull()
        }
    })

    it('los colores salen de los tokens, no de valores escritos', () => {
        for (const selector of ['.fe-file-drop', '.fe-avatar-preview', '.fe-code-cell', '.fe-group-title', '.fe-icon-button-danger']) {
            expect(rule(selector), `${selector} escribe un color`).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
        }
    })

    it('la zona de archivos se ve al arrastrar encima y al enfocarla', () => {
        expect(components).toMatch(/\.fe-file-drop\[data-dragging='true'\]/)
        expect(rule('.fe-file-drop:focus-visible')).toMatch(/outline:/)
    })

    it('las casillas del código no enseñan las flechas de un campo numérico', () => {
        expect(components).toMatch(/\.fe-code-cell::-webkit-inner-spin-button/)
    })

    it('lo que ocupa su caja no depende del reset del anfitrión', () => {
        for (const selector of ['.fe-file-drop', '.fe-avatar-preview', '.fe-code-cell']) {
            expect(rule(selector), `${selector} sin box-sizing`).toMatch(/box-sizing:\s*border-box/)
        }
    })

    /**
     * El botón rojo de borrar tiene que ganar al hover genérico del botón de
     * icono, que va antes en la hoja con la misma especificidad.
     */
    it('el boton de icono de peligro va despues del generico', () => {
        expect(components.indexOf('.fe-icon-button-danger')).toBeGreaterThan(components.indexOf('.fe-icon-button:hover:not(:disabled)'))
    })
})

describe('telefono', () => {
    /**
     * CountrySelectInputComponent envuelve vue-tel-input en Vue y
     * react-phone-number-input en React. El de React salía como un <select> y
     * un <input> nativos, y el de Vue con clases de Tailwind y colores
     * escritos; ninguno seguía el tema ni el modo oscuro.
     */
    const PHONE = [
        '.fe-phone',
        '.fe-phone:focus-within',
        '.fe-phone-invalid',
        '.fe-phone input',
        '.fe-phone.PhoneInput',
        '.fe-phone.vue-tel-input',
        '.fe-phone.vue-tel-input:focus-within',
        '.fe-phone .vti__dropdown-list',
        '.fe-phone .vti__dropdown-item.highlighted',
    ]

    it('cada pieza tiene su regla', () => {
        for (const selector of PHONE) {
            expect(rule(selector), `falta la regla ${selector}`).not.toBeNull()
        }
    })

    it('los colores salen de los tokens, no de valores escritos', () => {
        for (const selector of PHONE) {
            expect(rule(selector), `${selector} escribe un color`).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
        }
    })

    it('se ve como un campo: mide lo mismo, enseña el foco y marca el error', () => {
        expect(rule('.fe-phone')).toMatch(/box-sizing:\s*border-box/)
        expect(rule('.fe-phone')).toMatch(/min-height:\s*var\(--fe-control-height\)/)
        expect(rule('.fe-phone:focus-within')).toMatch(/var\(--fe-focus\)/)
        expect(rule('.fe-phone-invalid')).toMatch(/var\(--fe-danger\)/)
    })

    /**
     * La hoja de vue-tel-input declara `.vue-tel-input` con la misma
     * especificidad que `.fe-phone` y se carga después.
     */
    it('en Vue gana al borde y al foco de la libreria', () => {
        expect(rule('.fe-phone.vue-tel-input')).toMatch(/border:/)
        expect(rule('.fe-phone.vue-tel-input:focus-within')).toMatch(/box-shadow:/)
    })

    it('la lista de paises vive en la capa de los desplegables', () => {
        expect(rule('.fe-phone .vti__dropdown-list')).toMatch(/z-index:\s*var\(--fe-z-dropdown\)/)
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
