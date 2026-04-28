"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase-client';
import { Feature, FEATURES_COLLECTION } from './features';

const FEATURES_CACHE_KEY = 'df_features_cache';
const FEATURES_VERSION_KEY = 'df_features_version';

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to load from cache first for immediate display (Hot-reload prep)
    const cached = localStorage.getItem(FEATURES_CACHE_KEY);
    if (cached) {
      try {
        setFeatures(JSON.parse(cached));
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cached features", e);
      }
    }

    // 2. Set up real-time listener
    const q = query(collection(db, FEATURES_COLLECTION), orderBy('category'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedFeatures: Feature[] = [];
      let maxVersion = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Feature;
        updatedFeatures.push({ ...data, id: doc.id });
        if (data.version > maxVersion) maxVersion = data.version;
      });

      // 3. Cache Invalidation Logic
      const currentVersion = parseInt(localStorage.getItem(FEATURES_VERSION_KEY) || '0');
      
      if (maxVersion > currentVersion) {
        console.log(`[FeatureDeployment] New version detected: ${maxVersion}. Updating cache.`);
        localStorage.setItem(FEATURES_CACHE_KEY, JSON.stringify(updatedFeatures));
        localStorage.setItem(FEATURES_VERSION_KEY, maxVersion.toString());
      }

      setFeatures(updatedFeatures);
      setLoading(false);
      setError(null);
    }, async (err) => {
      console.warn("Firestore real-time listener failed, falling back to API fetch:", err);
      
      try {
        // Fallback to standard API fetch if Listen channel fails (e.g., ERR_ABORTED)
        const res = await fetch('/api/features');
        const data = await res.json();
        if (data.success) {
          setFeatures(data.features);
          setError(null);
        } else {
          setError("Failed to load features via fallback.");
        }
      } catch (fetchErr) {
        console.error("Feature fallback fetch failed:", fetchErr);
        setError("Real-time sync unavailable and fallback failed.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { features, loading, error };
}
