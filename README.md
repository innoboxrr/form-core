# innoboxrr-form-core

Lo que comparten [`innoboxrr-form-elements`](../form-elements) (Vue),
[`innoboxrr-react-form-elements`](../react-form-elements) (React) y los dos
datatables, y no depende de ningún framework: el tema, los iconos, las hojas de
estilo, los archivos y las zonas horarias.

Estaba duplicado en los paquetes, que es exactamente como dos copias empiezan a
divergir.

```
npm i innoboxrr-form-core
```

## Estilos

```js
import 'innoboxrr-form-core/styles'
```

Una sola importación trae las tres hojas: `tokens.css` (las variables),
`layout.css` (las utilidades de maquetación) y `components.css` (los
componentes). Nada de lo generado necesita UIkit, Tailwind ni Font Awesome.

Colores, formas, densidad, capas y movimiento son variables CSS. Para cambiar el
aspecto de todo, se redefinen:

```css
:root {
    --fe-primary: #7c3aed;
    --fe-radius: 10px;
    --fe-density: 0.875;
}
```

El modo oscuro responde a la preferencia del sistema y a un `data-theme="dark"`
en la raíz; `data-theme="light"` fuerza el claro aunque el sistema esté en
oscuro.

## Tema

Un mapa de tokens que la aplicación ajusta **una vez**, al arrancar. Cada token
apunta a una clase del sistema propio (`fe-*`), así que el caso normal es no
tocarlo; sirve para apuntar un token a las clases de otro sistema visual cuando
la aplicación ya tiene el suyo:

```js
import { setTheme } from 'innoboxrr-form-core'

setTheme({
    input: 'form-control',
    button: 'btn btn-primary',
})
```

| Grupo | Tokens |
|---|---|
| Envoltorios | `field`, `fieldInner`, `label`, `help`, `helpIcon`, `error` |
| Controles | `input`, `select`, `textarea`, `checkbox`, `radio`, `file` |
| Botones | `button`, `buttonSecondary`, `buttonDanger`, `buttonLink`, `iconButton` |
| Navegación | `breadcrumb`, `breadcrumbLink`, `breadcrumbCurrent`, `breadcrumbSeparator`, `actionMenu`, `actionMenuItem`, `actionMenuDanger`, `kbd` |
| Superficies | `surface`, `surfaceRaised`, `toolbar`, `badge`, `badgePrimary`, `badgeSuccess`, `badgeDanger`, `badgeWarning` |
| Esqueletos | `skeleton`, `skeletonText`, `skeletonCircle`, `skeletonBlock` |
| Diálogos y drawers | `overlay`, `dialog`, `dialogSmall`, `dialogLarge`, `dialogHeader`, `dialogTitle`, `dialogBody`, `dialogFooter`, `drawer`, `drawerStart`, `drawerHeader`, `drawerTitle`, `drawerBody`, `drawerFooter` |
| Menús | `menu`, `menuList`, `menuItem`, `menuItemDanger`, `menuSeparator`, `menuLabel` |
| Paleta de comandos | `command`, `commandInput`, `commandList`, `commandGroup`, `commandItem`, `commandEmpty` |
| Avisos | `toast`, `toastSuccess`, `toastDanger`, `toastWarning`, `toastTitle`, `toastClose`, `toastRegion` |
| Tabla | `table`, `tableNumeric`, `tableSticky`, `tableSelect`, `tableResizer`, `tableEmpty`, `bulkBar`, `bulkCount` |
| Edición en línea | `editable` |
| Shell de aplicación | `shell`, `shellHeader`, `shellSidebar`, `shellMain` |

`customClass` **reemplaza** al token, para el caso puntual:

```js
import { getTheme, resetTheme, onThemeChange, classFor } from 'innoboxrr-form-core'

getTheme()            // el tema completo
getTheme('input')     // la clase de un token
classFor('input', c)  // el token, salvo que llegue customClass
resetTheme()          // vuelve a fábrica (sobre todo para pruebas)
onThemeChange(fn)     // devuelve la función para dejar de escuchar
```

Los paquetes de componentes se suscriben, así que **un `setTheme` en caliente
repinta lo que ya esté montado**.

## Piezas de escritorio

Diálogos, drawers, menús y avisos se apoyan en lo que ya hace el navegador, sin
librerías de interfaz: `<dialog>` con `showModal()` pone la capa superior, el
fondo inerte, el foco atrapado, Escape para cerrar y la devolución del foco; el
atributo `popover` pone el cierre al pulsar fuera. Estas hojas solo los dibujan.
Los componentes de Vue y React envuelven exactamente este marcado.

```html
<dialog class="fe-drawer">
    <header class="fe-drawer-header">
        <h2 class="fe-drawer-title">Nuevo producto</h2>
        <button class="fe-icon-button" aria-label="Cerrar">…</button>
    </header>
    <div class="fe-drawer-body">…</div>
    <footer class="fe-drawer-footer">…</footer>
</dialog>
```

- **Diálogo**: `fe-dialog`, con `fe-dialog-sm` o `fe-dialog-lg` para el ancho.
- **Drawer**: `fe-drawer` a la derecha; `fe-drawer-start` lo pega a la izquierda.
- **Paleta de comandos**: `<dialog class="fe-dialog fe-command">` con
  `fe-command-input` y una `fe-command-list` de `fe-command-item`; el elemento
  activo lleva `aria-selected="true"`.
- **Avisos**: una `fe-toast-region` con `popover="manual"`, para seguir encima
  de un drawer abierto con `showModal()`.
- **Menús**: `fe-menu` con `popover`, colocado con Floating UI.
- **Tabla**: `fe-table-select` para la columna de casillas, `data-selected` en
  la fila, `fe-bulk-bar` para lo que se hace con la selección y
  `fe-table-resizer` para cambiar el ancho de una columna.

Un `<dialog>` cerrado está oculto porque el navegador le pone `display: none`;
por eso ninguna regla fija `display` fuera del estado `[open]`. Las capas que no
viven en la capa superior —la cabecera fija de una tabla, un overlay dibujado a
mano, los tooltips— siguen la escala `--fe-z-*`, nunca un número suelto.

## Iconos

Un nombre semántico y un mapa que decide de dónde sale el dibujo. Los valores son
nombres de Iconify (`coleccion:icono`):

```js
import { setIcons, iconFor } from 'innoboxrr-form-core'

setIcons({ plus: 'lucide:plus', delete: 'lucide:trash-2' })
iconFor('plus')      // 'lucide:plus'
iconFor('mdi:home')  // un nombre completo pasa tal cual
```

## Avisos y confirmaciones

Estado de toda la aplicación, fuera del framework: quien avisa —un store, el
contrato de un modelo, la tabla— no necesita saber si detrás hay Vue o React.
Los paquetes de componentes lo pintan con su región de avisos y su anfitrión de
confirmaciones, que la aplicación monta una vez.

```js
import { notify, notifySuccess, notifyError, confirmAction } from 'innoboxrr-form-core'

notifySuccess('Producto creado')
notifyError('No se pudo guardar', { title: 'Producto' })
notify({ message: 'Exportación en curso', variant: 'info', duration: 8000 })

if (await confirmAction({ message: '¿Borrar el producto?', variant: 'danger' })) {
    // …
}
```

- Un aviso se va a los cinco segundos; **uno de peligro se queda** hasta que se
  cierra, porque quien no lo leyó a tiempo no sabría qué falló. `duration: 0` lo
  deja fijo.
- No se apilan más de cinco: sale el más antiguo.
- `confirmAction` resuelve `true` o `false`. Una pregunta nueva con otra
  pendiente da la anterior por cancelada.
- Sin un anfitrión montado, `confirmAction` usa `window.confirm`: una promesa que
  no se resolviera dejaría colgada la acción que la espera.

Para pintarlos desde otro sitio: `getToasts`, `onToastsChange`, `dismiss`,
`getConfirmation`, `onConfirmationChange` y `resolveConfirmation`. `resetToasts`
y `resetConfirmation` vacían el estado entre pruebas.

## Archivos

```js
import { describeFiles, sizeParser, isImage } from 'innoboxrr-form-core'

describeFiles(files, { maxSize: 2048, validMimes: ['image/png'] })
// [{ file, name, size, type, preview, uploaded, validation, errors, path, id }]
```

`describeFiles` **no toca los `File`**. La versión anterior les escribía las
propiedades encima con `Object.assign`: el `File` es del navegador y no es
sitio para campos inventados, y así no se podía describir el mismo archivo dos
veces con reglas distintas. El original sigue a mano en `.file`, que es lo que
hay que meter en el `FormData`.

`validateFiles` es la misma función devolviendo una promesa, por compatibilidad.

## Zonas horarias

```js
import { timezones } from 'innoboxrr-form-core'
// [{ label: 'America/Mexico_City', value: 'America/Mexico_City' }, ...]
```

## Pruebas

```
npm test
```
