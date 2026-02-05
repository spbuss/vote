
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: number;
  likes: number;
  userLiked: boolean;
  replies?: Comment[];
}

export interface Question {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  category: string;
  yesVotes: number;
  noVotes: number;
  userVote: 'yes' | 'no' | null;
  likes: number;
  userLiked: boolean;
  comments: Comment[];
  createdAt: number;
}

export type View = 'home' | 'search' | 'add' | 'feed' | 'profile' | 'edit-profile';
