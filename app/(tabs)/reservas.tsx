import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { supabase } from '../../supabase'

export default function Reservas() {
  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {
    async function cargarPedidos() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from("pedidos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
      if (data) setPedidos(data)
    }
    cargarPedidos()
  }, [])

  const colorEstado = (estado: string) => {
    if (estado === 'pendiente') return '#F59E0B'
    if (estado === 'confirmado') return '#1D9E75'
    if (estado === 'en_proceso') return '#185FA5'
    if (estado === 'listo') return '#0D6E52'
    return '#888'
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Mis reservas</Text>
      <Text style={styles.subtitulo}>{pedidos.length} pedidos en total</Text>

      {pedidos.length === 0 && (
        <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>
          Todavía no tenés reservas
        </Text>
      )}

      {pedidos.map((pedido) => (
        <View key={pedido.id} style={styles.card}>
          <Text style={styles.nombre}>{pedido.lavadero_nombre}</Text>
          <Text>Precio: Gs. {pedido.precio}</Text>
          <Text style={{ color: colorEstado(pedido.estado), fontWeight: 'bold', marginTop: 4 }}>
            {pedido.estado.toUpperCase()}
          </Text>
          <Text style={styles.fecha}>
            {new Date(pedido.created_at).toLocaleDateString('es-PY')}
          </Text>
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
    padding: 15,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e8e8e8'
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4
  },
  fecha: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 6
  }
})