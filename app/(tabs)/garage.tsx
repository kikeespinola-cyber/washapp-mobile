import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native'
import { supabase } from '../../supabase'

export default function Garage() {
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [color, setColor] = useState('')
  const [patente, setPatente] = useState('')

  useEffect(() => {
    cargarVehiculos()
  }, [])

  async function cargarVehiculos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("vehiculos")
      .select("*")
      .eq("user_id", user.id)
    if (data) setVehiculos(data)
  }

  async function agregarVehiculo() {
    if (!marca || !modelo) return
    const { data: { user } } = await supabase.auth.getUser()
    console.log("User ID:", user?.id)
    console.log("Datos:", marca, modelo, color, patente)
    if (!user) return
    const { data, error } = await supabase.from("vehiculos").insert({
      user_id: user.id,
      marca,
      modelo,
      color,
      patente
    })
    console.log("Resultado:", data, error)
    setMarca('')
    setModelo('')
    setColor('')
    setPatente('')
    setModalVisible(false)
    cargarVehiculos()
  }

  async function eliminarVehiculo(id: number) {
    await supabase.from("vehiculos").delete().eq("id", id)
    cargarVehiculos()
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Mi garage</Text>
        <Text style={styles.subtitulo}>{vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} registrado{vehiculos.length !== 1 ? 's' : ''}</Text>

        {vehiculos.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🚗</Text>
            <Text style={{ fontSize: 14, color: '#aaa', textAlign: 'center' }}>Todavía no tenés vehículos guardados</Text>
          </View>
        )}

        {vehiculos.map((v) => (
          <View key={v.id} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{v.marca} {v.modelo}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>{v.color} · {v.patente}</Text>
              </View>
              <TouchableOpacity onPress={() => eliminarVehiculo(v.id)}>
                <Text style={{ color: '#E24B4A', fontSize: 20 }}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitulo}>Agregar vehículo</Text>

            <TextInput style={styles.input} placeholder="Marca (ej: Toyota)" value={marca} onChangeText={setMarca} />
            <TextInput style={styles.input} placeholder="Modelo (ej: Hilux)" value={modelo} onChangeText={setModelo} />
            <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />
            <TextInput style={styles.input} placeholder="Patente (ej: ABC 123)" value={patente} onChangeText={setPatente} autoCapitalize="characters" />

            <TouchableOpacity style={styles.boton} onPress={agregarVehiculo}>
              <Text style={styles.botonTexto}>Guardar vehículo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#f1f1f1', marginTop: 8 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#555', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
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
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginBottom: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e8e8e8'
  },
  nombre: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111'
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    padding: 24
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
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
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16
  },
  input: {
    backgroundColor: '#f7f8fa',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 14
  },
  boton: {
    backgroundColor: '#1D9E75',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  }
})