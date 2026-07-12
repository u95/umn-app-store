/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppModel {
  id: string;
  name: string;
  developer: string;
  version: string;
  category: string;
  description: string;
  icon: string;
  apk: string;
  screenshots: string[];
  downloads: number;
  rating: number;
  size: string;
  createdAt: string;
  status: 'published' | 'draft' | 'suspended';
  featured?: boolean;
  trending?: boolean;
  updatedAt?: string;
  reviewsCount?: number;
}

export type CategoryType = 'Books' | 'Education' | 'Music' | 'Bible' | 'Games' | 'Tools' | 'Lifestyle';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ReviewModel {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
