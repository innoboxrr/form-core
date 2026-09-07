# innoboxrr-form-core

Lo que comparten [`innoboxrr-form-elements`](../form-elements) (Vue) y
[`innoboxrr-react-form-elements`](../react-form-elements) (React) y no depende
de ningún framework.

Estaba duplicado en los dos paquetes, que es exactamente como dos copias
empiezan a divergir.

```
npm i innoboxrr-form-core
```

## Tema

Antes cada componente llevaba su cadena CSS incrustada como valor por defecto
de `customClass` —repetida en los dos paquetes— y el código que genera
`larapack-generator` esperaba `inputClass` y `buttonClass` de un mixin global
que la aplicación anfitriona tenía que registrar sin que nada lo dijera.

Ahora es un mapa de tokens que la aplicación ajusta **una vez**, al arrancar:

```js
import { setTheme } from 'innoboxrr-form-core'

setTheme({
    input: 'form-control',
    select: 'form-select',
    button: 'btn btn-primary',
})
```

Los tokens:

| Grupo | Tokens |
|---|---|
| Envoltorios | `field`, `fieldInner`, `label`, `help`, `helpIcon`, `error` |
| Controles | `input`, `select`, `textarea`, `checkbox`, `radio`, `file` |
| Botones | `button`, `buttonSecondary`, `buttonDanger`, `buttonLink` |

Los valores de fábrica son los de UIkit + Tailwind que ya usaba el ecosistema,
así que actualizar no cambia nada de aspecto.

`customClass` sigue existiendo y **reemplaza** al token, para el caso puntual.
Antes unos controles lo reemplazaban y otros lo sumaban a una clase incrustada;
ahora se comportan todos igual.

```js
import { getTheme, resetTheme, onThemeChange, classFor } from 'innoboxrr-form-core'

getTheme()            // el tema completo
getTheme('input')     // la clase de un token
classFor('input', c)  // el token, salvo que llegue customClass
resetTheme()          // vuelve a fábrica (sobre todo para pruebas)
onThemeChange(fn)     // devuelve la función para dejar de escuchar
```

Los dos paquetes de componentes se suscriben, así que **un `setTheme` en
caliente repinta lo que ya esté montado**: leerlo directamente no lo haría,
porque el tema es estado de módulo, fuera del framework.

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

La vista previa de lo que no es imagen es un `data:` URI. Antes era una URL de
`icon-library.com`: cada archivo disparaba una petición a un tercero que puede
caerse o cambiar.

## Zonas horarias

```js
import { timezones } from 'innoboxrr-form-core'
// [{ label: 'America/Mexico_City', value: 'America/Mexico_City' }, ...]
```

## Pruebas

```
npm test
```
