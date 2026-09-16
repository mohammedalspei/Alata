/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  features: string[];
  iconName: string; // Used to identify Lucide icons
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'medical' | 'gas_station' | 'residential' | 'commercial' | 'infrastructure' | 'interior';
  categoryLabel: string;
  image: string;
  images?: string[]; // Multiple additional images
  location: string;
  area: string;
  status: 'completed' | 'ongoing';
  statusLabel: string;
  year: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string; // Beautiful placeholder fallback or custom vector representation
  type: string; // Government or Private
}

export interface ConsultationRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceType: string;
  constructionDetails: string;
  city: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'contacted';
}
