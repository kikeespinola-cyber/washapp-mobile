import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native'
import { supabase } from '../../supabase'

export default function HomeScreen() {
  const [lavaderos, setLavaderos] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [servicioElegido, setServicioElegido] = useState<any>(null)

  useEffect(() => {
    async function cargarLavaderos() {
      const { data } = await supabase.from("lavaderos").select("*")
      if (data) setLavaderos(data)
    }
    cargarLavaderos()
  }, [])

  async function cargarServicios(lavaderoNombre: string) {
    const { data } = await supabase
      .from("servicios")
      .select("*")
      .eq("lavadero_nombre", lavaderoNombre)
    if (data) setServicios(data)
  }

  async function hacerReserva() {
    if (!seleccionado || !servicioElegido) return
    const lavaderoActual = seleccionado
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("pedidos").insert({
      lavadero_id: lavaderoActual.id,
      lavadero_nombre: lavaderoActual.nombre,
      precio: servicioElegido.precio,
      estado: "pendiente",
      user_id: user?.id
    })
    if (error) {
      console.log("Error:", error.message)
    } else {
      setSeleccionado(null)
      setServicioElegido(null)
      alert("¡Reserva confirmada!")
      if (lavaderoActual.whatsapp) {
        const mensaje = `Hola! Acabo de hacer una reserva en WashApp para ${lavaderoActual.nombre}. Servicio: ${servicioElegido.nombre}. Precio: Gs. ${servicioElegido.precio}.`
        const url = `https://wa.me/${lavaderoActual.whatsapp}?text=${encodeURIComponent(mensaje)}`
        Linking.openURL(url)
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>WashApp</Text>
        <Text style={styles.subtitulo}>Encontrá el mejor lavadero cerca de vos</Text>

        {lavaderos.map((lavadero) => (
          <View key={lavadero.nombre} style={styles.card}>
            <Text style={styles.nombre}>{lavadero.nombre}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>📍 {lavadero.zona}</Text>
            <Text>⭐ {lavadero.calificacion}</Text>
            <Text>Precio: Gs. {lavadero.precio}</Text>
            <Text style={{ color: lavadero.abierto ? '#1D9E75' : '#E24B4A' }}>
              {lavadero.abierto ? '✓ Abierto' : '✗ Cerrado'}
            </Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                setSeleccionado(lavadero)
                setServicioElegido(null)
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
            <Text style={styles.nombre}>{seleccionado?.nombre}</Text>
            <Text>⭐ {seleccionado?.calificacion}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>📍 {seleccionado?.zona}</Text>

            <Text style={{ fontSize: 13, fontWeight: '500', marginTop: 8, marginBottom: 6 }}>Elegí un servicio:</Text>
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

            {seleccionado?.abierto ? (
              <TouchableOpacity
                style={[styles.boton, { opacity: servicioElegido ? 1 : 0.4 }]}
                onPress={hacerReserva}
              >
                <Text style={styles.botonTexto}>
                  {servicioElegido ? `Reservar — Gs. ${servicioElegido.precio}` : 'Elegí un servicio'}
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
    marginBottom: 20
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