import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native'
import { supabase } from '../../supabase'

export default function Reservas() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [resenaModal, setResenaModal] = useState(false)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null)
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
    if (data) setPedidos(data)
  }

  async function enviarResena() {
    if (!pedidoSeleccionado || estrellas === 0) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("resenas").insert({
      user_id: user?.id,
      lavadero_nombre: pedidoSeleccionado.lavadero_nombre,
      estrellas,
      comentario
    })
    await supabase.from("pedidos").update({ calificado: true }).eq("id", pedidoSeleccionado.id)
    setResenaModal(false)
    setEstrellas(0)
    setComentario('')
    setPedidoSeleccionado(null)
    cargarPedidos()
    alert("¡Gracias por tu calificación!")
  }

  async function reReservar(pedido: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("pedidos").insert({
      lavadero_id: pedido.lavadero_id,
      lavadero_nombre: pedido.lavadero_nombre,
      precio: pedido.precio,
      estado: "pendiente",
      user_id: user.id,
      horario: pedido.horario
    })
    if (error) {
      console.log("Error:", error.message)
    } else {
      await supabase.rpc('sumar_puntos', { user_uuid: user.id, puntos_a_sumar: 10 })
      alert(`¡Reserva en ${pedido.lavadero_nombre} confirmada para las ${pedido.horario}!`)
      cargarPedidos()
    }
  }

  const colorEstado = (estado: string) => {
    if (estado === 'pendiente') return '#F59E0B'
    if (estado === 'confirmado') return '#1D9E75'
    if (estado === 'en_proceso') return '#185FA5'
    if (estado === 'listo') return '#0D6E52'
    return '#888'
  }

  return (
    <View style={{ flex: 1 }}>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={styles.nombre}>{pedido.lavadero_nombre}</Text>
              <Text style={{ fontSize: 11, color: '#aaa' }}>
                {new Date(pedido.created_at).toLocaleDateString('es-PY')}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {pedido.horario && `🕐 ${pedido.horario} · `}Gs. {pedido.precio?.toLocaleString('es-PY')}
            </Text>
            <Text style={{ color: colorEstado(pedido.estado), fontWeight: 'bold', marginTop: 4, fontSize: 12 }}>
              {pedido.estado.toUpperCase()}
            </Text>

            <TouchableOpacity
              style={{ marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1D9E75', alignSelf: 'flex-start' }}
              onPress={() => reReservar(pedido)}
            >
              <Text style={{ color: '#1D9E75', fontSize: 12, fontWeight: '500' }}>🔁 Repetir reserva</Text>
            </TouchableOpacity>

            {pedido.estado === 'listo' && !pedido.calificado && (
              <TouchableOpacity
                style={[styles.boton, { marginTop: 8 }]}
                onPress={() => {
                  setPedidoSeleccionado(pedido)
                  setEstrellas(0)
                  setComentario('')
                  setResenaModal(true)
                }}
              >
                <Text style={styles.botonTexto}>⭐ Calificar servicio</Text>
              </TouchableOpacity>
            )}

            {pedido.calificado && (
              <Text style={{ color: '#1D9E75', fontSize: 12, marginTop: 6 }}>✓ Ya calificaste este servicio</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={resenaModal} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitulo}>Calificá tu experiencia</Text>
            <Text style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              {pedidoSeleccionado?.lavadero_nombre}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setEstrellas(n)}>
                  <Text style={{ fontSize: 36, color: n <= estrellas ? '#F59E0B' : '#e0e0e0' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {estrellas > 0 && (
              <Text style={{ textAlign: 'center', color: '#1D9E75', fontWeight: '500', marginBottom: 12 }}>
                {estrellas === 1 ? 'Malo' : estrellas === 2 ? 'Regular' : estrellas === 3 ? 'Bueno' : estrellas === 4 ? 'Muy bueno' : 'Excelente'}
              </Text>
            )}

            <TextInput
              style={{
                backgroundColor: '#f7f8fa',
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: '#e0e0e0',
                padding: 12,
                fontSize: 14,
                marginBottom: 16,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
              placeholder="Contá tu experiencia (opcional)..."
              value={comentario}
              onChangeText={setComentario}
              multiline
            />

            <TouchableOpacity
              style={[styles.boton, { opacity: estrellas > 0 ? 1 : 0.4 }]}
              onPress={enviarResena}
            >
              <Text style={styles.botonTexto}>Enviar calificación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: '#f1f1f1', marginTop: 8 }]}
              onPress={() => setResenaModal(false)}
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
    fontSize: 14,
    fontWeight: '500',
    color: '#111'
  },
  boton: {
    backgroundColor: '#1D9E75',
    borderRadius: 8,
    padding: 10,
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
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4
  }
})