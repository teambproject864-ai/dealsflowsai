"use client";

import { useState } from 'react';
import { Feature, APP_FEATURES } from './features';

export function useFeatures() {
  const [features] = useState<Feature[]>(APP_FEATURES);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { features, loading, error };
}
