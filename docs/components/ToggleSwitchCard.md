# ToggleSwitchCard

Componente wrapper para ToggleSwitch de PrimeVue con diseño en formato card, etiqueta y tooltip informativo opcional.

## Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `modelValue` | `Boolean` | Sí | - | Valor del toggle (v-model) |
| `inputId` | `String` | Sí | - | ID único del input |
| `label` | `String` | Sí | - | Texto de la etiqueta |
| `hint` | `String` | No | `null` | Texto del tooltip informativo |
| `disabled` | `Boolean` | No | `false` | Deshabilita el toggle |

## Events

| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitido al cambiar el estado del toggle |
| `activated` | - | Emitido solo cuando el toggle se activa (true) |

## Uso básico
```vue
<ToggleSwitchCard
    v-model="form.campo"
    input-id="campo"
    label="Activar opción"
/>
```

## Con hint
```vue
<ToggleSwitchCard
    v-model="form.campo"
    input-id="campo"
    label="Activar opción"
    hint="Esta opción permite configurar el comportamiento del sistema"
/>
```

## Deshabilitado
```vue
<ToggleSwitchCard
    v-model="form.campo"
    input-id="campo"
    label="Opción bloqueada"
    :disabled="true"
/>
```

## Toggles mutuamente exclusivos
```vue
<template>
    <ToggleSwitchCard
        v-model="form.opcion1"
        @activated="handleExclusive('opcion1')"
        input-id="opcion1"
        label="Opción 1"
    />
    <ToggleSwitchCard
        v-model="form.opcion2"
        @activated="handleExclusive('opcion2')"
        input-id="opcion2"
        label="Opción 2"
    />
    <ToggleSwitchCard
        v-model="form.opcion3"
        @activated="handleExclusive('opcion3')"
        input-id="opcion3"
        label="Opción 3"
    />
</template>

<script setup>
const form = reactive({
    opcion1: false,
    opcion2: false,
    opcion3: false,
});

const handleExclusive = (field) => {
    Object.keys(form).forEach(key => {
        if (key !== field) form[key] = false;
    });
};
</script>
```

## Características

- Diseño en formato card con bordes y padding
- Hover states visuales (borde y fondo)
- Icono informativo con tooltip al pasar el mouse
- Soporte para estado deshabilitado
- Evento `activated` solo cuando se activa (útil para lógica exclusiva)
- Animaciones suaves en transiciones
- Responsive y mobile-friendly

## Estilos

El componente utiliza variables CSS de PrimeVue para mantener consistencia con el tema:
- `--p-inputtext-border-color`: Color del borde en hover
- `--p-surface-50`: Color de fondo en hover
- `--p-surface-400/600`: Colores del icono de información