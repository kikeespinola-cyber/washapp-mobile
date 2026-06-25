import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../../supabase'

export default function Perfil() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '')
    })
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.valor}>{email}</Text>
      </View>

      <TouchableOpacity
        style={styles.botonSalir}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f7f8fa'
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginTop: 60,
    marginBottom: 24
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    marginBottom: 12
  },
  label: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  valor: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500'
  },
  botonSalir: {
    backgroundColor: '#FCEBEB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16
  },
  botonSalirTexto: {
    color: '#E24B4A',
    fontWeight: 'bold',
    fontSize: 15
  }
})