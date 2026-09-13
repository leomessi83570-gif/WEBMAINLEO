import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useUser } from '../context/UserContext';

export default function ProgressScreen() {
  const { logs } = useUser();
  const sorted = [...logs].reverse();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <FlatList
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        data={sorted}
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={<Text style={styles.paragraph}>Aucune séance enregistrée pour l'instant.</Text>}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.logDate}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
            <Text style={styles.logTitle}>{item.session_name || item.type}</Text>
            {item.notes ? <Text style={styles.logNotes}>{item.notes}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 16, paddingHorizontal: 20 },
  paragraph: { color: '#888', fontSize: 14 },
  logCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  logDate: { color: '#888', fontSize: 12 },
  logTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  logNotes: { color: '#ccc', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
});
