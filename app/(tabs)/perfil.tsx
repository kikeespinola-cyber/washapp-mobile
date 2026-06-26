import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '../../supabase'

export default function Perfil() {
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('')
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pendientes: 0,
    completados: 0,
    ingresosMes: 0,
    calificacion: 0,
    lavaderoNombre: ''
  })

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single()
      if (perfil) setRol(perfil.rol)

      if (perfil?.rol === 'lavadero') {
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("*")

        if (pedidos) {
          const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
          const completados = pedidos.filter(p => p.estado === 'listo' || p.estado === 'completado').length
          const ingresosMes = pedidos
            .filter(p => p.estado === 'listo' || p.estado === 'completado')
            .reduce((acc, p) => acc + (p.precio || 0), 0)

          setStats({
            totalPedidos: pedidos.length,
            pendientes,
            completados,
            ingresosMes,
            calificacion: 4.8,
            lavaderoNombre: pedidos[0]?.lavadero_nombre ?? ''
          })
        }
      }
    }
    cargarDatos()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>W</Text>
          <View style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' }} />
          <View style={{ position: 'absolute', top: 2, right: 13, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <View style={{ position: 'absolute', top: 8, right: 1, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1D9E75' }}>Wash</Text>
          <Text style={{ fontSize: 24, fontWeight: '300', color: '#0F1923' }}>App</Text>
        </View>
      </View>

      {rol === 'lavadero' && (
        <>
          <Text style={styles.seccion}>Resumen del negocio</Text>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{stats.totalPedidos}</Text>
              <Text style={styles.statLbl}>Pedidos totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.pendientes}</Text>
              <Text style={styles.statLbl}>Pendientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#1D9E75' }]}>{stats.completados}</Text>
              <Text style={styles.statLbl}>Completados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: '#1D9E75', fontSize: 14 }]}>
                Gs. {stats.ingresosMes.toLocaleString('es-PY')}
              </Text>
              <Text style={styles.statLbl}>Ingresos totales</Text>
            </View>
          </View>
        </>
      )}

      <Text style={styles.seccion}>Mi cuenta</Text>
      <View style={styles.card}>
        <View style={styles.fila}>
          <Text style={styles.filaLbl}>Email</Text>
          <Text style={styles.filaVal}>{email}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLbl}>Rol</Text>
          <View style={{ backgroundColor: rol === 'lavadero' ? '#E1F5EE' : '#f1f1f1', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: rol === 'lavadero' ? '#085041' : '#555' }}>
              {rol === 'lavadero' ? 'Administrador de lavadero' : 'Usuario'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.botonSalir}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f8fa'
  },
  seccion: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#aaa',
    marginBottom: 10,
    marginTop: 8
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    width: '47%',
    alignItems: 'center'
  },
  statVal: {
    fontSize: 26,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4
  },
  statLbl: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    marginBottom: 12
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  filaLbl: {
    fontSize: 13,
    color: '#aaa'
  },
  filaVal: {
    fontSize: 13,
    color: '#111',
    fontWeight: '500'
  },
  botonSalir: {
    backgroundColor: '#FCEBEB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40
  },
  botonSalirTexto: {
    color: '#E24B4A',
    fontWeight: 'bold',
    fontSize: 15
  }
})