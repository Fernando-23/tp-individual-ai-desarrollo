import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useApi } from '../src/contexto/UsuarioContext';
import { useRecurso } from '../src/hooks/useRecurso';
import { useTema } from '../src/hooks/useTema';
import { avisarError } from '../src/componentes/avisos';
import { Boton } from '../src/componentes/Boton';
import { Campo } from '../src/componentes/Campo';
import { Chip } from '../src/componentes/Chip';
import { Pantalla } from '../src/componentes/Pantalla';
import { formatearFecha } from '../src/logica/formato';
import { validarEvento } from '../src/logica/validarEvento';
import { espacio, radio, tipografia } from '../src/tema';

let siguienteClave = 1;
const tipoVacio = (nombre = '') => ({ clave: siguienteClave++, nombre, descripcion: '', precio: '', cupo: '' });

function mananaALas21() {
  const f = new Date();
  f.setDate(f.getDate() + 1);
  f.setHours(21, 0, 0, 0);
  return f;
}

/** Historia 10: publicar un evento con uno o más tipos de entrada (FR-018). */
export default function Publicar() {
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const cargarCategorias = useCallback(() => api.eventos.categorias(), [api]);
  const { datos: categorias } = useRecurso(cargarCategorias);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: null,
    fecha: null,
    imagen: '',
    tiposEntrada: [tipoVacio('General')],
  });
  const [errores, setErrores] = useState({});
  const [intentado, setIntentado] = useState(false);
  const [publicando, setPublicando] = useState(false);

  // Después del primer intento, los errores se recalculan mientras se corrige.
  function actualizar(cambio) {
    setForm((previo) => {
      const nuevo = { ...previo, ...cambio };
      if (intentado) setErrores(validarEvento(nuevo, new Date()).errores);
      return nuevo;
    });
  }

  function actualizarTipo(clave, cambio) {
    actualizar({ tiposEntrada: form.tiposEntrada.map((t) => (t.clave === clave ? { ...t, ...cambio } : t)) });
  }

  // Android: primero la fecha, después la hora (selectores nativos, research D9).
  function elegirFecha() {
    const inicial = form.fecha ?? mananaALas21();
    DateTimePickerAndroid.open({
      value: inicial,
      mode: 'date',
      minimumDate: new Date(),
      onValueChange: (_evento, dia) => {
        DateTimePickerAndroid.open({
          value: dia,
          mode: 'time',
          is24Hour: true,
          onValueChange: (_e, hora) => {
            const fecha = new Date(dia);
            fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
            actualizar({ fecha });
          },
        });
      },
    });
  }

  async function publicar() {
    setIntentado(true);
    const resultado = validarEvento(form, new Date());
    setErrores(resultado.errores);
    if (!resultado.valido) {
      Alert.alert('Revisá el formulario', 'Hay campos para corregir: están marcados con ⚠.');
      return;
    }
    setPublicando(true);
    try {
      const evento = await api.eventos.publicar(resultado.datos);
      router.replace(`/evento/${evento.id}`);
    } catch (e) {
      avisarError(e, 'No se pudo publicar');
    } finally {
      setPublicando(false);
    }
  }

  return (
    <Pantalla margenInferior>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Campo etiqueta="Nombre del evento" value={form.nombre} onChangeText={(nombre) => actualizar({ nombre })} error={errores.nombre} maxLength={80} />
        <Campo etiqueta="Descripción" value={form.descripcion} onChangeText={(descripcion) => actualizar({ descripcion })} error={errores.descripcion} multiline maxLength={600} />

        <View style={estilos.grupo}>
          <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>Categoría</Text>
          <View style={estilos.chips}>
            {(categorias ?? []).map((c) => (
              <Chip key={c.id} texto={c.nombre} seleccionado={form.categoriaId === c.id} onPress={() => actualizar({ categoriaId: c.id })} />
            ))}
          </View>
          {errores.categoriaId ? <Text style={[tipografia.chico, { color: tema.error }]}>⚠ {errores.categoriaId}</Text> : null}
        </View>

        <View style={estilos.grupo}>
          <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>Fecha y hora</Text>
          <Boton
            titulo={form.fecha ? formatearFecha(form.fecha.toISOString()) : 'Elegir fecha y hora'}
            icono="calendar"
            variante="secundario"
            onPress={elegirFecha}
            accessibilityLabel={form.fecha ? `Fecha elegida: ${formatearFecha(form.fecha.toISOString())}. Cambiar` : 'Elegir fecha y hora'}
          />
          {errores.fecha ? <Text style={[tipografia.chico, { color: tema.error }]}>⚠ {errores.fecha}</Text> : null}
        </View>

        <Campo
          etiqueta="Imagen (dirección web)"
          opcional
          value={form.imagen}
          onChangeText={(imagen) => actualizar({ imagen })}
          error={errores.imagen}
          placeholder="https://…"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
          Tipos de entrada
        </Text>
        {errores.tiposEntrada ? <Text style={[tipografia.chico, { color: tema.error }]}>⚠ {errores.tiposEntrada}</Text> : null}

        {form.tiposEntrada.map((t, i) => (
          <View key={t.clave} style={[estilos.tipo, { backgroundColor: tema.superficie, borderColor: tema.divisor }]}>
            <Text style={[tipografia.cuerpoFuerte, { color: tema.textoSecundario }]}>Tipo {i + 1}</Text>
            <Campo etiqueta="Nombre" value={t.nombre} onChangeText={(nombre) => actualizarTipo(t.clave, { nombre })} error={errores[`tipos.${i}.nombre`]} placeholder="General, Platea, VIP…" />
            <View style={estilos.dosColumnas}>
              <Campo estilo={estilos.columna} etiqueta="Precio ($)" value={t.precio} onChangeText={(precio) => actualizarTipo(t.clave, { precio })} error={errores[`tipos.${i}.precio`]} keyboardType="number-pad" placeholder="0 = gratis" />
              <Campo estilo={estilos.columna} etiqueta="Cupo" value={t.cupo} onChangeText={(cupo) => actualizarTipo(t.clave, { cupo })} error={errores[`tipos.${i}.cupo`]} keyboardType="number-pad" />
            </View>
            <Campo etiqueta="Descripción" opcional value={t.descripcion} onChangeText={(descripcion) => actualizarTipo(t.clave, { descripcion })} />
            <Boton
              titulo="Quitar este tipo"
              icono="trash-outline"
              variante="secundario"
              deshabilitado={form.tiposEntrada.length === 1}
              onPress={() => actualizar({ tiposEntrada: form.tiposEntrada.filter((x) => x.clave !== t.clave) })}
              accessibilityLabel={`Quitar el tipo ${t.nombre || i + 1}`}
              accessibilityHint={form.tiposEntrada.length === 1 ? 'Tiene que haber al menos un tipo de entrada' : undefined}
            />
          </View>
        ))}

        <Boton titulo="Agregar otro tipo de entrada" icono="add" variante="secundario" onPress={() => actualizar({ tiposEntrada: [...form.tiposEntrada, tipoVacio()] })} />
        <Boton titulo="Publicar evento" icono="megaphone" onPress={publicar} cargando={publicando} />
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l, paddingBottom: espacio.xxl },
  grupo: { gap: espacio.s },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  tipo: { padding: espacio.l, borderRadius: radio.m, borderWidth: 1, gap: espacio.m },
  dosColumnas: { flexDirection: 'row', gap: espacio.m },
  columna: { flex: 1 },
});
