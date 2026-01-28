export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  specialization: string;
  photo: string;
  experience: string;
  bio: string;
  instagram?: string;
  assignment?: string[];
  progress?: string;
  attendance?: string;
  createdAt: string;
  updatedAt: string;
}