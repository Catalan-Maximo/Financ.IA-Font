import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/AuthContext';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface RegisterScreenProps {
  /** Cambia a la pantalla de login. */
  onGoToLogin: () => void;
}

/**
 * Pantalla de registro: crea un usuario nuevo y entra directo
 * con el token que devuelve el backend.
 */
export default function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const send = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // Éxito: App reacciona al token y pasa al flujo principal
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? 'No se pudo registrar el usuario.'
        : 'No se pudo conectar con el backend.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={s.screen}>
      <Header text="Crear Cuenta" level="title" style={s.title} />
      <Text style={s.subtitle}>Registrate para empezar a invertir</Text>

      <Card style={s.card}>
        <Input
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
        />

        <Button
          title="Registrarme"
          icon="person-add-outline"
          haptics
          onPress={send}
          loading={loading}
          style={s.button}
        />
      </Card>

      <View style={s.footer}>
        <Text style={s.footerText}>¿Ya tenés cuenta?</Text>
        <Pressable onPress={onGoToLogin}>
          <Text style={s.footerLink}>Iniciá sesión</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: { justifyContent: 'center' },
    title: { textAlign: 'center' },
    subtitle: {
      ...typography.body,
      color: colors.secondaryLabel,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    card: { padding: spacing.lg },
    button: { marginTop: spacing.xl },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    footerText: { ...typography.body, color: colors.secondaryLabel },
    footerLink: { ...typography.body, color: colors.brand, fontWeight: '600' },
  });
