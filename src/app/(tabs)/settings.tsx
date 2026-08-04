import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface SettingSectionProps {
  title: string;
  items: { icon: string; label: string; action?: () => void }[];
}

export default function SettingsScreen() {
  const [session, setSession] = useState<any>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await supabase.auth.signInWithPassword({ email, password });
      } else {
        await supabase.auth.signUp({ email, password });
      }
      setAuthModalVisible(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const SettingsSection = ({ title, items }: SettingSectionProps) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 8, paddingHorizontal: 16 }}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.settingItem, idx < items.length - 1 && styles.borderBottom]}
            onPress={item.action}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color="#94a3b8" />
              <Text style={{ color: '#e2e8f0', fontSize: 16, marginLeft: 16 }}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#475569" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Section */}
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#334155' }}>
            {session ? (
              <Text style={{ color: '#059669', fontSize: 32, fontWeight: 'bold' }}>{session.user.email?.charAt(0).toUpperCase()}</Text>
            ) : (
              <MaterialCommunityIcons name="account-outline" size={40} color="#64748b" />
            )}
          </View>
          
          {session ? (
            <>
              <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>User</Text>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>{session.user.email}</Text>
            </>
          ) : (
            <TouchableOpacity 
              style={{ backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
              onPress={() => setAuthModalVisible(true)}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>

        <SettingsSection 
          title="ACCOUNT" 
          items={[
            { icon: 'account-edit-outline', label: 'Edit Profile' },
            { icon: 'lock-outline', label: 'Change Password' },
            ...(session ? [{ icon: 'logout', label: 'Sign Out', action: handleSignOut }] : [])
          ]} 
        />

        <SettingsSection 
          title="PREFERENCES" 
          items={[
            { icon: 'bell-outline', label: 'Notifications' },
            { icon: 'theme-light-dark', label: 'Dark Mode' },
            { icon: 'format-size', label: 'Text Size' }
          ]} 
        />

        <SettingsSection 
          title="SUPPORT" 
          items={[
            { icon: 'help-circle-outline', label: 'Help Center' },
            { icon: 'message-alert-outline', label: 'Contact Support' },
            { icon: 'bug-outline', label: 'Report a Bug' },
            { icon: 'star-outline', label: 'Rate the App' }
          ]} 
        />

        <SettingsSection 
          title="ABOUT" 
          items={[
            { icon: 'information-outline', label: 'Version 1.0.0' },
            { icon: 'file-document-outline', label: 'Terms of Service' },
            { icon: 'shield-check-outline', label: 'Privacy Policy' }
          ]} 
        />

        <Text style={{ textAlign: 'center', color: '#475569', marginTop: 20 }}>Smart Fridge AI v1.0.0</Text>
      </ScrollView>

      {/* Auth Modal */}
      <Modal visible={authModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' }}>
          <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={loading}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setIsLogin(!isLogin)}>
            <Text style={{ color: '#059669' }}>
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ marginTop: 40, alignItems: 'center' }} onPress={() => setAuthModalVisible(false)}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  authBtn: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  }
});
