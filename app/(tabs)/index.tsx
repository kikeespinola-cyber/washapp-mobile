import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native'
import { supabase } from '../../supabase'

export default function HomeScreen() {
  const [lavaderos, setLavaderos] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<any>(null)

  useEffect(() => {
    async function cargarLavaderos() {
      const { data } = await supabase.from("lavaderos").select("*")
      if (data) setLavaderos(data)
    }
    cargarLavaderos()
  }, [])

  async function hacerReserva() {
    if (!seleccionado) return
    const { error } = await supabase.from("pedidos").insert({
      lavadero_id: seleccionado.id,
      lavadero_nombre: seleccionado.nombre,
      precio: seleccionado.precio,
      estado: "pendiente"
    })
    if (error) {
      console.log("Error:", error.message)
    } else {
      setSeleccionado(null)
      alert("¡Reserva confirmada!")
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>WashApp</Text>
        <Text style={styles.subtitulo}>Encontrá el mejor lavadero cerca de vos</Text>

        {lavaderos.map((lavadero) => (
          <View key={lavadero.id} style={styles.card}>
            <Text style={styles.nombre}>{lavadero.nombre}</Text>
            <Text>⭐ {lavadero.calificacion}</Text>
            <Text>Precio: Gs. {lavadero.precio}</Text>
            <Text style={{ color: lavadero.abierto ? '#1D9E75' : '#E24B4A' }}>
              {lavadero.abierto ? '✓ Abierto' : '✗ Cerrado'}
            </Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => setSeleccionado(lavadero)}
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
          <View style={styles.modalPanel}>
            <Text style={styles.nombre}>{seleccionado?.nombre}</Text>
            <Text>⭐ {seleccionado?.calificacion}</Text>
            <Text>Precio: Gs. {seleccionado?.precio}</Text>
            <Text style={{ color: seleccionado?.abierto ? '#1D9E75' : '#E24B4A', marginBottom: 16 }}>
              {seleccionado?.abierto ? '✓ Abierto' : '✗ Cerrado'}
            </Text>
            {seleccionado?.abierto ? (
              <TouchableOpacity style={styles.boton} onPress={hacerReserva}>
                <Text style={styles.botonTexto}>Reservar</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: '#E24B4A' }}>No disponible</Text>
            )}
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#f1f1f1', marginTop: 10 }]}
              onPress={() => setSeleccionado(null)}
            >
              <Text style={{ color: '#555', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
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
    padding: 24
  }
})