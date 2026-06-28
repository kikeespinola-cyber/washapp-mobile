import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, TextInput } from 'react-native'
import { supabase } from '../../supabase'

export default function HomeScreen() {
  const [lavaderos, setLavaderos] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioElegido, setServicioElegido] = useState<any>(null)
  const [horarioElegido, setHorarioElegido] = useState<string>('')
  const [nombreUsuario, setNombreUsuario] = useState<string>('')
  const [busqueda, setBusqueda] = useState<string>('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setNombreUsuario(user.email?.split('@')[0] ?? '')
      const { data } = await supabase.from("lavaderos").select("*")
      if (data) setLavaderos(data)
    }
    cargarDatos()
  }, [])

  async function cargarServicios(lavaderoNombre: string) {
    const { data } = await supabase
      .from("servicios")
      .select("*")
      .eq("lavadero_nombre", lavaderoNombre)
    if (data) setServicios(data)
  }

  async function hacerReserva() {
    if (!seleccionado || !servicioElegido || !horarioElegido) return
    const lavaderoActual = seleccionado
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("pedidos").insert({
      lavadero_id: lavaderoActual.id,
      lavadero_nombre: lavaderoActual.nombre,
      precio: servicioElegido.precio,
      estado: "pendiente",
      user_id: user?.id,
      horario: horarioElegido
    })
    if (error) {
      console.log("Error:", error.message)
    } else {
      setSeleccionado(null)
      setServicioElegido(null)
      setHorarioElegido('')
      await supabase.rpc('sumar_puntos', { user_uuid: user?.id, puntos_a_sumar: 10 })
      alert("¡Reserva confirmada!")
      if (lavaderoActual.whatsapp) {
        const mensaje = `Hola! Acabo de hacer una reserva en WashApp para ${lavaderoActual.nombre}. Servicio: ${servicioElegido.nombre}. Horario: ${horarioElegido}. Precio: Gs. ${servicioElegido.precio}.`
        const url = `https://wa.me/${lavaderoActual.whatsapp}?text=${encodeURIComponent(mensaje)}`
        Linking.openURL(url)
      }
    }
  }

  const lavaderosFiltrados = lavaderos.filter(l =>
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (l.zona && l.zona.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>W</Text>
            <View style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' }} />
            <View style={{ position: 'absolute', top: 2, right: 13, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }} />
            <View style={{ position: 'absolute', top: 8, right: 1, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1D9E75' }}>Wash</Text>
            <Text style={{ fontSize: 28, fontWeight: '300', color: '#0F1923' }}>App</Text>
          </View>
        </View>
        <Text style={styles.subtitulo}>Hola, {nombreUsuario} 👋</Text>
        <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>Encontrá el mejor lavadero cerca de vos</Text>

        <TextInput
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: '#e0e0e0',
            padding: 10,
            fontSize: 14,
            marginBottom: 16,
            paddingHorizontal: 14
          }}
          placeholder="🔍 Buscar lavadero o zona..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {lavaderosFiltrados.length === 0 && (
          <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
            No encontramos lavaderos con ese nombre o zona
          </Text>
        )}

        {lavaderosFiltrados.map((lavadero) => (
          <View key={lavadero.nombre} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>🚗</Text>
              </View>
              <View>
                <Text style={styles.nombre}>{lavadero.nombre}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>📍 {lavadero.zona}</Text>
              </View>
            </View>
            <Text>⭐ {lavadero.calificacion}</Text>
            <Text style={{ color: lavadero.abierto ? '#1D9E75' : '#E24B4A' }}>
              {lavadero.abierto ? '✓ Abierto' : '✗ Cerrado'}
            </Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                setSeleccionado(lavadero)
                setServicioElegido(null)
                setHorarioElegido('')
                cargarServicios(lavadero.nombre)
              }}
            >
              <Text style={styles.botonTexto}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={seleccionado !== null}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalFondo}>
          <ScrollView style={styles.modalPanel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>🚗</Text>
              </View>
              <View>
                <Text style={styles.nombre}>{seleccionado?.nombre}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>📍 {seleccionado?.zona}</Text>
              </View>
            </View>
            <Text>⭐ {seleccionado?.calificacion}</Text>

            <Text style={{ fontSize: 13, fontWeight: '500', marginTop: 12, marginBottom: 6 }}>Elegí un servicio:</Text>
            {servicios.map((servicio) => (
              <TouchableOpacity
                key={servicio.id}
                onPress={() => setServicioElegido(servicio)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 6,
                  borderWidth: 1.5,
                  borderColor: servicioElegido?.id === servicio.id ? '#1D9E75' : '#e0e0e0',
                  backgroundColor: servicioElegido?.id === servicio.id ? '#E1F5EE' : '#fff'
                }}
              >
                <Text style={{ fontWeight: '500' }}>{servicio.nombre}</Text>
                <Text style={{ color: '#1D9E75', fontSize: 12 }}>Gs. {servicio.precio} · {servicio.duracion_minutos} min</Text>
              </TouchableOpacity>
            ))}

            <Text style={{ fontSize: 13, fontWeight: '500', marginTop: 12, marginBottom: 6 }}>Elegí un horario:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hora) => (
                <TouchableOpacity
                  key={hora}
                  onPress={() => setHorarioElegido(hora)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: horarioElegido === hora ? '#1D9E75' : '#e0e0e0',
                    backgroundColor: horarioElegido === hora ? '#E1F5EE' : '#fff'
                  }}
                >
                  <Text style={{ fontSize: 13, color: horarioElegido === hora ? '#085041' : '#555', fontWeight: horarioElegido === hora ? '500' : '400' }}>
                    {hora}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {seleccionado?.abierto ? (
              <TouchableOpacity
                style={[styles.boton, { opacity: servicioElegido && horarioElegido ? 1 : 0.4 }]}
                onPress={hacerReserva}
              >
                <Text style={styles.botonTexto}>
                  {servicioElegido && horarioElegido
                    ? `Reservar ${horarioElegido} — Gs. ${servicioElegido.precio}`
                    : 'Elegí servicio y horario'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: '#E24B4A' }}>No disponible</Text>
            )}

            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#f1f1f1', marginTop: 10 }]}
              onPress={() => {
                setSeleccionado(null)
                setServicioElegido(null)
                setHorarioElegido('')
              }}
            >
              <Text style={{ color: '#555', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f8fa'
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginTop: 60
  },
  subtitulo: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    marginBottom: 4
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e8e8e8'
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  boton: {
    backgroundColor: '#1D9E75',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center'
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalPanel: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%'
  }
})