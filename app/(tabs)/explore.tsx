
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '../../supabase'

export default function PanelLavadero() {
  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    const { data } = await supabase.from("pedidos").select("*")
    if (data) setPedidos(data)
  }

  async function cambiarEstado(id: number, nuevoEstado: string) {
    await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", id)
    cargarPedidos()
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Panel Lavadero</Text>
      <Text style={styles.subtitulo}>Pedidos recibidos</Text>

      {pedidos.map((pedido) => (
        <View key={pedido.id} style={styles.card}>
          <Text style={styles.nombre}>{pedido.lavadero_nombre}</Text>
          <Text>Precio: Gs. {pedido.precio}</Text>
          <Text>Estado: <Text style={{ color: '#1D9E75', fontWeight: 'bold' }}>{pedido.estado}</Text></Text>

          {pedido.estado === 'pendiente' && (
            <TouchableOpacity
              style={styles.boton}
              onPress={() => cambiarEstado(pedido.id, 'confirmado')}
            >
              <Text style={styles.botonTexto}>Confirmar pedido</Text>
            </TouchableOpacity>
          )}

          {pedido.estado === 'confirmado' && (
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#F59E0B' }]}
              onPress={() => cambiarEstado(pedido.id, 'en_proceso')}
            >
              <Text style={styles.botonTexto}>Iniciar lavado</Text>
            </TouchableOpacity>
          )}

          {pedido.estado === 'en_proceso' && (
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#0D6E52' }]}
              onPress={() => cambiarEstado(pedido.id, 'listo')}
            >
              <Text style={styles.botonTexto}>Marcar listo</Text>
            </TouchableOpacity>
          )}

          {pedido.estado === 'listo' && (
            <Text style={{ color: '#0D6E52', fontWeight: 'bold', marginTop: 8 }}>✓ Listo para retirar</Text>
          )}
        </View>
      ))}
    </ScrollView>
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
    color: '#0D6E52',
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
  }
})