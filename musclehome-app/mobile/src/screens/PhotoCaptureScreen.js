import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { analyzeBody } from '../services/api';
import Mascot from '../components/Mascot';
import { getMascotLine } from '../utils/mascotLines';

const SHOTS = [
  { key: 'face', label: 'De face, bras le long du corps', tipKey: 'photo_tip_face' },
  { key: 'profil', label: 'De profil (côté droit)', tipKey: 'photo_tip_profil' },
];

export default function PhotoCaptureScreen({ navigation }) {
  const { profile, update } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const currentShot = SHOTS[step];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tipLine = useMemo(() => getMascotLine(currentShot.tipKey), [currentShot.key]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
    setPhotos((prev) => ({ ...prev, [currentShot.key]: photo }));
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotos((prev) => ({ ...prev, [currentShot.key]: asset }));
    }
  };

  const retake = () => {
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[currentShot.key];
      return next;
    });
  };

  const next = async () => {
    if (step < SHOTS.length - 1) {
      setStep(step + 1);
      return;
    }
    // dernière photo validée -> on lance l'analyse
    setLoading(true);
    try {
      const payload = {
        profile,
        photos: SHOTS.map((s) => ({
          key: s.key,
          base64: photos[s.key].base64,
        })),
      };
      const analysis = await analyzeBody(payload);
      await update({ analysis });
      navigation.replace('AnalysisResult');
    } catch (e) {
      console.warn(e);
      Alert.alert(
        "Analyse impossible",
        "Vérifie que le serveur backend tourne et que l'adresse API_BASE_URL est correcte."
      );
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    Alert.alert(
      'Passer l\'analyse photo ?',
      "Tu pourras avoir un programme générique, mais sans l'analyse morphologique/posture personnalisée (fonctionnalité premium).",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Passer', onPress: () => navigation.replace('AnalysisResult', { skipped: true }) },
      ]
    );
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>On a besoin de la caméra pour l'analyse morphologique.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Passer cette étape</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasCurrentPhoto = !!photos[currentShot.key];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo {step + 1}/{SHOTS.length}</Text>
      <Text style={styles.instruction}>{currentShot.label}</Text>

      {!hasCurrentPhoto && (
        <View style={{ marginTop: 10, marginBottom: 4 }}>
          <Mascot line={tipLine} tag="Conseil de Buffalo" />
        </View>
      )}

      <View style={styles.cameraBox}>
        {hasCurrentPhoto ? (
          <Image source={{ uri: photos[currentShot.key].uri }} style={styles.preview} />
        ) : (
          <CameraView ref={cameraRef} style={styles.preview} facing="back" />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3B30" style={{ marginTop: 24 }} />
      ) : hasCurrentPhoto ? (
        <View style={styles.rowButtons}>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={retake}>
            <Text style={styles.buttonText}>Reprendre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={next}>
            <Text style={styles.buttonText}>
              {step < SHOTS.length - 1 ? 'Photo suivante' : "Lancer l'analyse"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rowButtons}>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={pickFromGallery}>
            <Text style={styles.buttonText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>Prendre la photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && (
        <TouchableOpacity onPress={skip} style={{ marginTop: 16 }}>
          <Text style={styles.skipText}>Passer cette étape</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', padding: 20, paddingTop: 60 },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  instruction: { color: '#fff', fontSize: 16, marginTop: 8 },
  hint: { color: '#888', fontSize: 13, marginTop: 4, marginBottom: 16 },
  cameraBox: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  preview: { flex: 1 },
  rowButtons: { flexDirection: 'row', marginTop: 16, gap: 12 },
  button: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#2C2C2E' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipText: { color: '#888', textAlign: 'center', textDecorationLine: 'underline' },
  text: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 16 },
});
