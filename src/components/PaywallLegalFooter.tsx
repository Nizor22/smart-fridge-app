// src/components/PaywallLegalFooter.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

interface PaywallLegalFooterProps {
  onRestorePurchases: () => Promise<void>;
  termsUrl?: string;
  privacyUrl?: string;
}

export default function PaywallLegalFooter({
  onRestorePurchases,
  termsUrl = 'https://smartfridge.ai/terms',
  privacyUrl = 'https://smartfridge.ai/privacy',
}: PaywallLegalFooterProps) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open link:', err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.disclosureText}>
        Subscription automatically renews monthly unless auto-renew is turned off at least 24 hours before the end of the current period. Payment will be charged to your Apple ID / Google Play Account at confirmation of purchase. You can manage or cancel your subscription in your App Store / Play Store Account Settings after purchase.
      </Text>

      <TouchableOpacity style={styles.restoreBtn} onPress={onRestorePurchases}>
        <Text style={styles.restoreBtnText}>Restore Purchases</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => openLink(termsUrl)}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <Text style={styles.divider}>•</Text>

        <TouchableOpacity onPress={() => openLink(privacyUrl)}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  disclosureText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  restoreBtn: {
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  restoreBtnText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
  divider: {
    fontSize: 12,
    color: '#475569',
  },
});
