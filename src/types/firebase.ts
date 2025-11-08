export interface ContentPost {
  title: string;
  content: string;
  platform: string;
  category: string;
  hashtags: string;
  scheduledDate: string;
  scheduledTime: string;
  assignee: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
  posts: number;
  lastActive: string;
  createdAt: Date;
}

export interface Partner {
  name: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  specialization: string;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
  projects: number;
  avatar: string;
  createdAt: Date;
}

export interface Analytics {
  platform: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
}