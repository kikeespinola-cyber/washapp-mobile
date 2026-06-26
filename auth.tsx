import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from './supabase'

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [mensaje, setMensaje] = useState('')

  async function handleAuth() {
    if (modo === 'registro') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMensaje(error.message)
      else setMensaje('Revisá tu email para confirmar el registro')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje(error.message)
      else onLogin()
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
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
      <Text style={styles.subtitulo}>{modo === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

      <TouchableOpacity style={styles.boton} onPress={handleAuth}>
        <Text style={styles.botonTexto}>{modo === 'login' ? 'Ingresar' : 'Registrarse'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}>
        <Text style={styles.link}>
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f7f8fa'
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitulo: {
    fontSize: 18,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 15
  },
  boton: {
    backgroundColor: '#1D9E75',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    color: '#1D9E75',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14
  },
  mensaje: {
    color: '#E24B4A',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13
  }
})