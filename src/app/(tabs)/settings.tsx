import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch, Alert, Linking, StyleSheet, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useFridges } from '../../hooks/useFridges';

export default function SettingsScreen() {
  const [session, setSession] = useState<any>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetCodeModalVisible, setResetCodeModalVisible] = useState(false);

  // Auth form
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset password
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetTimer, setResetTimer] = useState(0);
  const timerRef = useRef<any>(null);

  // Profile edit
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [supportMessage, setSupportMessage] = useState('');

  // Fridge management
  const { userId } = useAuth();
  const { fridges, createFridge, joinFridge, leaveFridge, deleteFridge, renameFridge, getMembers, fetchFridges } = useFridges(userId);
  const [fridgeModalVisible, setFridgeModalVisible] = useState(false);
  const [newFridgeName, setNewFridgeName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [fridgeMembers, setFridgeMembers] = useState<any[]>([]);
  const [viewingFridgeId, setViewingFridgeId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
    });
    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setEditFirstName(data.first_name || '');
      setEditLastName(data.last_name || '');
      setEditPhone(data.phone || '');
    }
  };

  // ── AUTH ──
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) { alert('Please fill in all required fields'); return; }

    if (isLogin) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (error) {
        alert(error.message);
        return;
      }
      clearForm();
      setAuthModalVisible(false);
    } else {
      // Sign up validation
      if (!firstName.trim() || !lastName.trim()) { alert('First and last name are required'); return; }
      if (!termsAccepted) { alert('You must accept the Terms & Conditions to create an account'); return; }
      if (password.length < 6) { alert('Password must be at least 6 characters'); return; }

      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } }
      });
      setLoading(false);

      if (error) {
        if (error.message?.toLowerCase().includes('already') || error.message?.toLowerCase().includes('exists') || error.message?.toLowerCase().includes('registered')) {
          Alert.alert(
            'Email Already Registered',
            'The email you are attempting to use is already signed up. Would you like to reset your password?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset Password', onPress: () => { setAuthModalVisible(false); setResetEmail(email); setResetModalVisible(true); } },
              { text: 'Sign In Instead', onPress: () => setIsLogin(true) }
            ]
          );
        } else {
          alert(error.message);
        }
        return;
      }

      // Create profile in profiles table
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          marketing_opt_in: marketingOptIn,
        });
      }

      Alert.alert('Account Created!', 'Welcome to Smart Fridge AI.');
      clearForm();
      setAuthModalVisible(false);
    }
  };

  const clearForm = () => {
    setEmail(''); setPassword(''); setFirstName(''); setLastName('');
    setPhone(''); setTermsAccepted(false); setMarketingOptIn(false);
  };

  // ── PASSWORD RESET ──
  const handleSendResetCode = async () => {
    if (!resetEmail.trim()) { alert('Please enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
    setLoading(false);
    if (error) { alert(error.message); return; }

    setResetModalVisible(false);
    setResetCodeModalVisible(true);
    setResetTimer(300); // 5 minutes

    timerRef.current = setInterval(() => {
      setResetTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyAndReset = async () => {
    if (resetTimer <= 0) { alert('Your code has expired. Please request a new one.'); return; }
    if (!resetToken.trim()) { alert('Please enter the code from your email'); return; }
    if (newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }

    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: resetEmail.trim(),
      token: resetToken.trim(),
      type: 'recovery',
    });

    if (verifyError) {
      setLoading(false);
      if (resetTimer <= 0) { alert('Your code has expired. Please request a new one.'); }
      else { alert(verifyError.message); }
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) { alert(updateError.message); return; }

    if (timerRef.current) clearInterval(timerRef.current);
    Alert.alert('Password Reset!', 'Your password has been changed. You are now signed in.');
    setResetCodeModalVisible(false);
    setResetEmail(''); setResetToken(''); setNewPassword('');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── PROFILE ──
  const handleUpdateProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) { alert('Name cannot be empty'); return; }
    setLoading(true);
    await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      phone: editPhone.trim() || null,
    });
    await supabase.auth.updateUser({ data: { first_name: editFirstName.trim(), last_name: editLastName.trim() } });
    setLoading(false);
    Alert.alert('Profile Updated!');
    setProfileModalVisible(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) alert(error.message);
    else { Alert.alert('Password Updated!'); setNewPassword(''); setPasswordModalVisible(false); }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() }
    ]);
  };

  // ── NOTIFICATIONS ──
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      try {
        const { default: Notifications } = await import('expo-notifications');
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') {
          setNotificationsEnabled(true);
          return;
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setNotificationsEnabled(true);
        } else {
          Alert.alert('Notifications Disabled', 'Please enable notifications in your device settings.', [
            { text: 'OK' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]);
          setNotificationsEnabled(false);
        }
      } catch {
        Alert.alert('Notifications', 'Notification permissions are not available in this environment.');
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleRateApp = () => {
    Alert.alert('Rate Smart Fridge AI', 'Would you like to rate us?', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Rate Now', onPress: () => Linking.openURL(Platform.OS === 'ios' ? 'https://apps.apple.com' : 'https://play.google.com') }
    ]);
  };

  const userName = session?.user?.user_metadata?.first_name
    ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
    : editFirstName ? `${editFirstName} ${editLastName}` : 'User';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={{ alignItems: 'center', paddingVertical: 32 }}>
          <View style={styles.avatar}>
            {session ? (
              <Text style={{ color: '#059669', fontSize: 32, fontWeight: 'bold' }}>{(userName.charAt(0) || 'U').toUpperCase()}</Text>
            ) : (
              <MaterialCommunityIcons name="account-outline" size={40} color="#64748b" />
            )}
          </View>
          {session ? (
            <>
              <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{userName}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>{session.user.email}</Text>
            </>
          ) : (
            <TouchableOpacity style={styles.signInBtn} onPress={() => { setIsLogin(true); setAuthModalVisible(true); }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <SettingsGroup title="ACCOUNT" items={[
          { icon: 'account-edit-outline', label: 'Edit Profile', action: () => session ? setProfileModalVisible(true) : alert('Please sign in first') },
          { icon: 'lock-outline', label: 'Change Password', action: () => session ? setPasswordModalVisible(true) : alert('Please sign in first') },
          { icon: 'lock-reset', label: 'Reset Password', action: () => setResetModalVisible(true) },
          ...(session ? [{ icon: 'logout', label: 'Sign Out', action: handleSignOut, destructive: true }] : [])
        ]} />

        {/* Shared Fridges Section */}
        {session && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 8, paddingHorizontal: 16 }}>MY FRIDGES</Text>
              <View style={styles.sectionCard}>
                {fridges.map((fridge, idx) => (
                  <TouchableOpacity
                    key={fridge.id}
                    style={[styles.settingItem, idx < fridges.length - 1 && styles.borderBottom]}
                    onPress={async () => {
                      const members = await getMembers(fridge.id);
                      setFridgeMembers(members);
                      setViewingFridgeId(fridge.id);
                      setFridgeModalVisible(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <MaterialCommunityIcons name="fridge-outline" size={22} color="#059669" />
                      <View style={{ marginLeft: 16 }}>
                        <Text style={{ color: '#e2e8f0', fontSize: 16 }}>{fridge.name}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{fridge.role === 'owner' ? 'Owner' : 'Member'} · Code: {fridge.invite_code}</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color="#475569" />
                  </TouchableOpacity>
                ))}
                {fridges.length === 0 && (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b' }}>No fridges yet</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, paddingHorizontal: 16 }}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1, padding: 12 }]}
                  onPress={() => {
                    Alert.prompt ? Alert.prompt('Create Fridge', 'Enter a name for your new fridge:', async (name: string) => {
                      if (name?.trim()) { await createFridge(name.trim()); }
                    }) : Alert.alert('Create Fridge', 'Enter a name:', [
                      { text: 'Cancel' },
                      { text: 'My Kitchen', onPress: () => createFridge('My Kitchen') },
                      { text: 'Family Fridge', onPress: () => createFridge('Family Fridge') },
                      { text: 'Office Fridge', onPress: () => createFridge('Office Fridge') },
                    ]);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>+ Create Fridge</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1, padding: 12, backgroundColor: '#334155' }]}
                  onPress={() => {
                    Alert.prompt ? Alert.prompt('Join Fridge', 'Enter the invite code:', async (code: string) => {
                      if (code?.trim()) {
                        const result = await joinFridge(code);
                        Alert.alert(result.success ? 'Success!' : 'Error', result.message);
                      }
                    }) : (() => {
                      // Fallback for Android which doesn't have Alert.prompt
                      setJoinCode('');
                      Alert.alert('Join Fridge', 'Use the join modal in fridge details');
                    })();
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontWeight: '600', textAlign: 'center' }}>Join Fridge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        <SettingsGroup title="PREFERENCES" items={[
          { icon: 'bell-outline', label: 'Notifications', toggle: true, value: notificationsEnabled, onToggle: handleNotificationToggle },
          { icon: 'theme-light-dark', label: 'Dark Mode', toggle: true, value: darkModeEnabled, onToggle: setDarkModeEnabled },
          { icon: 'format-size', label: 'Text Size', action: () => Alert.alert('Text Size', 'Coming in the next update!') },
        ]} />

        <SettingsGroup title="SUPPORT" items={[
          { icon: 'help-circle-outline', label: 'Help Center', action: () => setHelpModalVisible(true) },
          { icon: 'message-alert-outline', label: 'Contact Support', action: () => setSupportModalVisible(true) },
          { icon: 'bug-outline', label: 'Report a Bug', action: () => Linking.openURL('mailto:support@smartfridge.ai?subject=Bug Report') },
          { icon: 'star-outline', label: 'Rate the App', action: handleRateApp },
        ]} />

        <SettingsGroup title="ABOUT" items={[
          { icon: 'information-outline', label: 'Version 1.0.0', action: () => alert('Smart Fridge AI v1.0.0\nBuilt with React Native & Expo') },
          { icon: 'file-document-outline', label: 'Terms of Service', action: () => Linking.openURL('https://smartfridge.ai/terms') },
          { icon: 'shield-check-outline', label: 'Privacy Policy', action: () => Linking.openURL('https://smartfridge.ai/privacy') },
        ]} />

        <Text style={{ textAlign: 'center', color: '#475569', marginTop: 20 }}>Smart Fridge AI v1.0.0</Text>
      </ScrollView>

      {/* ── AUTH MODAL ── */}
      <Modal visible={authModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 10 }} onPress={() => setAuthModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#94a3b8" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

            {!isLogin && (
              <>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InputField label="First Name *" value={firstName} onChange={setFirstName} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField label="Last Name *" value={lastName} onChange={setLastName} />
                  </View>
                </View>
                <InputField label="Phone Number" value={phone} onChange={setPhone} keyboardType="phone-pad" />
              </>
            )}

            <InputField label="Email *" value={email} onChange={setEmail} keyboardType="email-address" />
            <InputField label="Password *" value={password} onChange={setPassword} secure />

            {!isLogin && (
              <>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted(!termsAccepted)}>
                  <MaterialCommunityIcons name={termsAccepted ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={termsAccepted ? '#059669' : '#64748b'} />
                  <Text style={styles.checkboxText}>I accept the <Text style={{ color: '#059669', textDecorationLine: 'underline' }}>Terms & Conditions</Text> *</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setMarketingOptIn(!marketingOptIn)}>
                  <MaterialCommunityIcons name={marketingOptIn ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={marketingOptIn ? '#059669' : '#64748b'} />
                  <Text style={styles.checkboxText}>I agree to receive marketing emails and text message campaigns (optional)</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={handleAuth} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => { setIsLogin(!isLogin); clearForm(); }}>
              <Text style={{ color: '#059669' }}>{isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}</Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => { setAuthModalVisible(false); setResetEmail(email); setResetModalVisible(true); }}>
                <Text style={{ color: '#94a3b8' }}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── RESET PASSWORD - Enter Email ── */}
      <Modal visible={resetModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Reset Password</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>Enter your email and we'll send you a reset code. The code expires in 5 minutes.</Text>
          <InputField label="Email" value={resetEmail} onChange={setResetEmail} keyboardType="email-address" />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSendResetCode} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setResetModalVisible(false)}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── RESET PASSWORD - Enter Code ── */}
      <Modal visible={resetCodeModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Reset Code</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 8 }}>A code was sent to {resetEmail}</Text>

          <View style={styles.timerBadge}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={resetTimer > 60 ? '#059669' : '#ef4444'} />
            <Text style={{ color: resetTimer > 60 ? '#059669' : '#ef4444', fontWeight: 'bold', marginLeft: 6 }}>
              {resetTimer > 0 ? `${formatTime(resetTimer)} remaining` : 'Code expired'}
            </Text>
          </View>

          <InputField label="Reset Code" value={resetToken} onChange={setResetToken} keyboardType="number-pad" />
          <InputField label="New Password" value={newPassword} onChange={setNewPassword} secure />

          {resetTimer > 0 ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyAndReset} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#f59e0b' }]} onPress={() => { setResetCodeModalVisible(false); setResetModalVisible(true); }}>
              <Text style={styles.primaryBtnText}>Request New Code</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => { setResetCodeModalVisible(false); if (timerRef.current) clearInterval(timerRef.current); }}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── EDIT PROFILE MODAL ── */}
      <Modal visible={profileModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <InputField label="First Name" value={editFirstName} onChange={setEditFirstName} />
          <InputField label="Last Name" value={editLastName} onChange={setEditLastName} />
          <InputField label="Phone" value={editPhone} onChange={setEditPhone} keyboardType="phone-pad" />
          <Text style={{ color: '#64748b', marginBottom: 24 }}>Email: {session?.user?.email}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setProfileModalVisible(false)}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <Modal visible={passwordModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <InputField label="New Password" value={newPassword} onChange={setNewPassword} secure />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleChangePassword} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setPasswordModalVisible(false)}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── CONTACT SUPPORT MODAL ── */}
      <Modal visible={supportModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Contact Support</Text>
          <Text style={{ color: '#94a3b8', marginBottom: 16 }}>Describe your issue and we'll respond within 24 hours.</Text>
          <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} placeholder="How can we help?" placeholderTextColor="#64748b" value={supportMessage} onChangeText={setSupportMessage} multiline />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { if (!supportMessage.trim()) return alert('Please enter a message'); alert('Message sent!'); setSupportMessage(''); setSupportModalVisible(false); }}>
            <Text style={styles.primaryBtnText}>Send Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setSupportModalVisible(false)}>
            <Text style={{ color: '#94a3b8' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── HELP CENTER MODAL ── */}
      <Modal visible={helpModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 40 }}>
            <Text style={styles.modalTitle}>Help Center</Text>
            {[
              { q: 'How do I scan items?', a: 'Tap the camera button on the Dashboard. Point your camera at food items and tap capture.' },
              { q: 'How do I remove items?', a: 'Tap the red X button on any item card to remove it.' },
              { q: 'How do AI recipes work?', a: 'Go to the AI Chef tab and tap "Generate Recipe". The AI creates a recipe from your current fridge contents.' },
              { q: 'Do I need an account?', a: 'Yes — you need to sign in to save items and sync across devices. Without an account, scanned items won\'t be saved.' },
              { q: 'Is my data secure?', a: 'All data is stored with row-level security in Supabase with encryption at rest.' },
              { q: 'How do I reset my password?', a: 'Go to Settings → Reset Password. Enter your email and you\'ll receive a code valid for 5 minutes.' },
            ].map((faq, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <Text style={{ color: '#059669', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{faq.q}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 20 }}>{faq.a}</Text>
              </View>
            ))}
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setHelpModalVisible(false)}>
              <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── FRIDGE DETAIL MODAL ── */}
      <Modal visible={fridgeModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {(() => {
            const fridge = fridges.find(f => f.id === viewingFridgeId);
            if (!fridge) return null;
            return (
              <>
                <Text style={styles.modalTitle}>{fridge.name}</Text>

                <View style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>INVITE CODE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#059669', fontSize: 24, fontWeight: 'bold', letterSpacing: 4 }}>{fridge.invite_code}</Text>
                    <TouchableOpacity onPress={() => {
                      Share.share({ message: `Join my fridge on Smart Fridge AI! Use invite code: ${fridge.invite_code}` });
                    }} style={{ backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>MEMBERS</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}>
                  {fridgeMembers.map((member: any, idx: number) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: idx < fridgeMembers.length - 1 ? 1 : 0, borderBottomColor: '#334155' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#059669', fontWeight: 'bold' }}>{(member.name?.charAt(0) || '?').toUpperCase()}</Text>
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#f8fafc', fontWeight: '600' }}>{member.name}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>{member.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {fridge.role === 'owner' ? (
                  <>
                    <TouchableOpacity style={[styles.primaryBtn, { marginBottom: 12 }]} onPress={async () => {
                      Alert.prompt ? Alert.prompt('Rename', 'New name:', async (name: string) => {
                        if (name?.trim()) { await renameFridge(fridge.id, name.trim()); setFridgeModalVisible(false); }
                      }, 'plain-text', fridge.name) : (() => {
                        renameFridge(fridge.id, fridge.name === 'My Fridge' ? 'Family Fridge' : 'My Fridge');
                        setFridgeModalVisible(false);
                      })();
                    }}>
                      <Text style={styles.primaryBtnText}>Rename Fridge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]} onPress={() => {
                      Alert.alert('Delete Fridge', 'This will delete all items in this fridge. Are you sure?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteFridge(fridge.id); setFridgeModalVisible(false); } }
                      ]);
                    }}>
                      <Text style={styles.primaryBtnText}>Delete Fridge</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]} onPress={() => {
                    Alert.alert('Leave Fridge', 'You will lose access to shared items.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Leave', style: 'destructive', onPress: async () => { await leaveFridge(fridge.id); setFridgeModalVisible(false); } }
                    ]);
                  }}>
                    <Text style={styles.primaryBtnText}>Leave Fridge</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setFridgeModalVisible(false)}>
                  <Text style={{ color: '#94a3b8' }}>Close</Text>
                </TouchableOpacity>
              </>
            );
          })()}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── REUSABLE COMPONENTS ──

function InputField({ label, value, onChange, secure, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#94a3b8', marginBottom: 6, fontSize: 14 }}>{label}</Text>
      <TextInput style={styles.input} placeholder={`Enter ${label.toLowerCase().replace(' *', '')}`} placeholderTextColor="#64748b" value={value} onChangeText={onChange} secureTextEntry={secure} autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'words'} keyboardType={keyboardType} />
    </View>
  );
}

function SettingsGroup({ title, items }: { title: string, items: any[] }) {
  return (
    <Animated.View entering={FadeInDown} style={{ marginBottom: 24 }}>
      <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 8, paddingHorizontal: 16 }}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item: any, idx: number) => (
          <TouchableOpacity key={idx} style={[styles.settingItem, idx < items.length - 1 && styles.borderBottom]} onPress={item.toggle ? undefined : item.action} activeOpacity={item.toggle ? 1 : 0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name={item.icon} size={22} color={item.destructive ? '#ef4444' : '#94a3b8'} />
              <Text style={{ color: item.destructive ? '#ef4444' : '#e2e8f0', fontSize: 16, marginLeft: 16 }}>{item.label}</Text>
            </View>
            {item.toggle ? (
              <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: '#334155', true: '#059669' }} thumbColor="#f8fafc" />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={22} color="#475569" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#059669' },
  signInBtn: { backgroundColor: '#059669', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  sectionCard: { backgroundColor: '#1e293b', borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalContainer: { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  modalTitle: { color: '#f8fafc', fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f8fafc', borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  primaryBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkboxText: { color: '#e2e8f0', fontSize: 14, marginLeft: 12, flex: 1 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 41, 59, 0.8)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center', marginBottom: 24 },
});
