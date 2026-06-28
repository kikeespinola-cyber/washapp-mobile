import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { supabase } from '../../supabase'
import { useRouter } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width - 40

export default function PanelLavadero() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [tab, setTab] = useState<'pedidos' | 'clientes' | 'analytics'>('pedidos')
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    async function verificarRol() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", user.id)
          .single()
        if (!data || data.rol !== 'lavadero') {
          router.replace('/')
        }
      }
    }
    verificarRol()
    cargarPedidos()
    cargarClientes()
  }, [])

  async function cargarPedidos() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) {
      setPedidos(data)
      generarChartData(data)
    }
  }

  function generarChartData(data: any[]) {
    const ultimos7 = []
    const labels = []
    const valores = []

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const dia = fecha.toLocaleDateString('es-PY', { weekday: 'short' })
      labels.push(dia)
      const count = data.filter(p => p.created_at?.startsWith(fechaStr)).length
      valores.push(count)
    }

    setChartData({ labels, datasets: [{ data: valores }] })
  }

  async function cargarClientes() {
    const { data } = await supabase
      .from("pedidos")
      .select("user_id, lavadero_nombre, precio, estado, created_at")
    if (!data) return

    const mapa: Record<string, any> = {}
    data.forEach((p) => {
      if (!p.user_id) return
      if (!mapa[p.user_id]) {
        mapa[p.user_id] = {
          user_id: p.user_id,
          totalVisitas: 0,
          totalGastado: 0,
          ultimaVisita: p.created_at
        }
      }
      mapa[p.user_id].totalVisitas++
      mapa[p.user_id].totalGastado += p.precio || 0
      if (p.created_at > mapa[p.user_id].ultimaVisita) {
        mapa[p.user_id].ultimaVisita = p.created_at
      }
    })

    setClientes(Object.values(mapa).sort((a, b) => b.totalVisitas - a.totalVisitas))
  }

  async function cambiarEstado(id: number, nuevoEstado: string) {
    await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", id)
    cargarPedidos()
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Panel Lavadero</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'pedidos' && styles.tabActivo]}
            onPress={() => setTab('pedidos')}
          >
            <Text style={[styles.tabTxt, tab === 'pedidos' && styles.tabTxtActivo]}>Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'clientes' && styles.tabActivo]}
            onPress={() => setTab('clientes')}
          >
            <Text style={[styles.tabTxt, tab === 'clientes' && styles.tabTxtActivo]}>Clientes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'analytics' && styles.tabActivo]}
            onPress={() => setTab('analytics')}
          >
            <Text style={[styles.tabTxt, tab === 'analytics' && styles.tabTxtActivo]}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'pedidos' && (
        <ScrollView style={styles.container}>
          {pedidos.length === 0 && (
            <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No hay pedidos todavía</Text>
          )}
          {pedidos.map((pedido) => (
            <View key={pedido.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.nombre}>{pedido.lavadero_nombre}</Text>
                <Text style={{ fontSize: 11, color: '#aaa' }}>
                  {new Date(pedido.created_at).toLocaleDateString('es-PY')}
                </Text>
              </View>
              <Text style={{ color: '#555', fontSize: 13 }}>
                {pedido.horario && `🕐 ${pedido.horario} · `}Gs. {pedido.precio?.toLocaleString('es-PY')}
              </Text>
              <Text style={{ fontSize: 12, marginTop: 2 }}>
                Estado: <Text style={{ color: '#1D9E75', fontWeight: 'bold' }}>{pedido.estado}</Text>
              </Text>
              {pedido.estado === 'pendiente' && (
                <TouchableOpacity style={styles.boton} onPress={() => cambiarEstado(pedido.id, 'confirmado')}>
                  <Text style={styles.botonTexto}>Confirmar pedido</Text>
                </TouchableOpacity>
              )}
              {pedido.estado === 'confirmado' && (
                <TouchableOpacity style={[styles.boton, { backgroundColor: '#F59E0B' }]} onPress={() => cambiarEstado(pedido.id, 'en_proceso')}>
                  <Text style={styles.botonTexto}>Iniciar lavado</Text>
                </TouchableOpacity>
              )}
              {pedido.estado === 'en_proceso' && (
                <TouchableOpacity style={[styles.boton, { backgroundColor: '#0D6E52' }]} onPress={() => cambiarEstado(pedido.id, 'listo')}>
                  <Text style={styles.botonTexto}>Marcar listo</Text>
                </TouchableOpacity>
              )}
              {pedido.estado === 'listo' && (
                <Text style={{ color: '#0D6E52', fontWeight: 'bold', marginTop: 8 }}>✓ Listo para retirar</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {tab === 'clientes' && (
        <ScrollView style={styles.container}>
          <Text style={styles.subtitulo}>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} en total</Text>
          {clientes.length === 0 && (
            <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Todavía no hay clientes</Text>
          )}
          {clientes.map((c, i) => (
            <View key={c.user_id} style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0D6E52' }}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>Cliente {i + 1}</Text>
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    Última visita: {new Date(c.ultimaVisita).toLocaleDateString('es-PY')}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1, backgroundColor: '#f7f8fa', borderRadius: 8, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#0D6E52' }}>{c.totalVisitas}</Text>
                  <Text style={{ fontSize: 11, color: '#aaa' }}>Visitas</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#f7f8fa', borderRadius: 8, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#0D6E52' }}>
                    Gs. {c.totalGastado.toLocaleString('es-PY')}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#aaa' }}>Total gastado</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === 'analytics' && (
        <ScrollView style={styles.container}>
          <Text style={styles.subtitulo}>Pedidos — últimos 7 días</Text>

          {chartData && (
            <LineChart
              data={chartData}
              width={screenWidth}
              height={200}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(13, 110, 82, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                style: { borderRadius: 10 },
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#0D6E52' }
              }}
              bezier
              style={{ borderRadius: 10, marginBottom: 16 }}
            />
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={styles.card}>
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#0D6E52' }}>{pedidos.length}</Text>
              <Text style={{ fontSize: 11, color: '#aaa' }}>Pedidos totales</Text>
            </View>
            <View style={styles.card}>
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#F59E0B' }}>
                {pedidos.filter(p => p.estado === 'pendiente').length}
              </Text>
              <Text style={{ fontSize: 11, color: '#aaa' }}>Pendientes</Text>
            </View>
            <View style={styles.card}>
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#0D6E52' }}>
                {pedidos.filter(p => p.estado === 'listo').length}
              </Text>
              <Text style={{ fontSize: 11, color: '#aaa' }}>Completados</Text>
            </View>
            <View style={styles.card}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#0D6E52' }}>
                Gs. {pedidos.reduce((acc, p) => acc + (p.precio || 0), 0).toLocaleString('es-PY')}
              </Text>
              <Text style={{ fontSize: 11, color: '#aaa' }}>Total facturado</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#f7f8fa'
  },
  container: {
    flex: 1,
    padding: 20
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D6E52',
    marginBottom: 14
  },
  subtitulo: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  tabActivo: {
    backgroundColor: '#0D6E52',
    borderColor: '#0D6E52'
  },
  tabTxt: {
    fontSize: 13,
    color: '#888'
  },
  tabTxtActivo: {
    color: '#fff',
    fontWeight: '500'
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
    color: '#111',
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