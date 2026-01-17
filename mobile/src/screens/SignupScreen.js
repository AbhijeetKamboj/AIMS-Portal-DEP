import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'admin', label: 'Admin' },
    { value: 'faculty_advisor', label: 'Faculty Advisor' },
  ];

  const handleSignup = async () => {
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(form.email.trim(), form.password, form.name.trim(), form.role);
      // Navigation will happen automatically via AuthContext
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>🎓 Create Account</Text>
          <Text style={styles.subtitle}>Sign up for Academic Portal</Text>
        </View>

        <Card style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            disabled={loading}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
            disabled={loading}
          />

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleButtons}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    form.role === role.value && styles.roleButtonActive,
                  ]}
                  onPress={() => setForm({ ...form, role: role.value })}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      form.role === role.value && styles.roleButtonTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            onPress={handleSignup}
            disabled={loading}
            fullWidth
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.goBack()}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    ...typography.body,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.bgTertiary,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
