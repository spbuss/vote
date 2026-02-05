
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from "./services/api";
import { Home, Search, User, Zap, TrendingUp, Filter, X, Plus, Heart, MessageSquare, BarChart3, Menu, Settings, Bell, Shield, LogOut, Info, Check, Sparkles, Send, Smartphone, Chrome, Mail, Camera, ChevronLeft } from 'lucide-react';
import { User as UserType, Question, Comment, View } from './types';
import { QuestionCard } from './components/QuestionCard';

// Categories constant
const CATEGORIES = [
  'General',
  'Dating',
  'Technology',
  'Ethics',
  'Food',
  'Cinema',
  'Lifestyle',
  'Relationships',
  'Sports',
  'Travel',
  'Health',
  'Politics',
  'Science',
  'Music'
];

// Mock Initial User
const INITIAL_USER: UserType & { interests?: string[] } = {
  id: 'u1',
  name: 'Alex Rivera',
  username: 'arivera',
  avatar: 'https://picsum.photos/seed/alex/200',
  bio: 'Exploring the intersection of tech and philosophy. Love deep conversations and coffee.',
  followers: 1240,
  following: 432,
  interests: ['Tech', 'Philosophy', 'Jazz', 'Hiking']
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    authorId: 'u2',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://picsum.photos/seed/sarah/200',
    category: 'Technology',
    content: 'Do you believe fully autonomous cars will be safer than human drivers within the next 5 years?',
    yesVotes: 145,
    noVotes: 89,
    userVote: null,
    likes: 24,
    userLiked: false,
    comments: [
      {
        id: 'c1',
        userId: 'u3',
        userName: 'Tom Black',
        userAvatar: 'https://picsum.photos/seed/tom/200',
        text: 'Infrastructure isn\'t ready yet, regardless of software progress.',
        createdAt: Date.now() - 3600000,
        likes: 5,
        userLiked: false,
        replies: [
          {
            id: 'r1',
            userId: 'u4',
            userName: 'Jordan Lee',
            userAvatar: 'https://picsum.photos/seed/jordan/200',
            text: 'Agreed, city planning needs to catch up first.',
            createdAt: Date.now() - 3000000,
            likes: 2,
            userLiked: false,
            replies: []
          }
        ]
      },
      {
        id: 'c-mock-1',
        userId: 'u4',
        userName: 'Jordan Lee',
        userAvatar: 'https://picsum.photos/seed/jordan/200',
        text: 'The trolley problem becomes a literal software requirement!',
        createdAt: Date.now() - 2500000,
        likes: 12,
        userLiked: true,
        replies: []
      }
    ],
    createdAt: Date.now() - 86400000
  },
  {
    id: 'q2',
    authorId: 'u4',
    authorName: 'Jordan Lee',
    authorAvatar: 'https://picsum.photos/seed/jordan/200',
    category: 'Dating',
    content: 'Is "ghosting" ever justifiable in the early stages of dating?',
    yesVotes: 112,
    noVotes: 345,
    userVote: 'no',
    likes: 89,
    userLiked: true,
    comments: [],
    createdAt: Date.now() - 172800000
  }
];

const updateCommentsList = (comments: Comment[], parentId: string, newComment: Comment): Comment[] => {
  return comments.map(c => {
    if (c.id === parentId) {
      return { ...c, replies: [newComment, ...(c.replies || [])] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: updateCommentsList(c.replies, parentId, newComment) };
    }
    return c;
  });
};

const removeCommentFromList = (comments: Comment[], commentId: string): Comment[] => {
  return comments.filter(c => c.id !== commentId).map(c => {
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: removeCommentFromList(c.replies, commentId) };
    }
    return c;
  });
};

const likeCommentInList = (comments: Comment[], commentId: string): Comment[] => {
  return comments.map(c => {
    if (c.id === commentId) {
      const newUserLiked = !c.userLiked;
      return { 
        ...c, 
        userLiked: newUserLiked, 
        likes: newUserLiked ? c.likes + 1 : c.likes - 1 
      };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: likeCommentInList(c.replies, commentId) };
    }
    return c;
  });
};

// --- Sub-Components to fix Hook violations ---

const EditProfileView: React.FC<{ userData: UserType & { interests?: string[] }, onSave: (data: UserType & { interests?: string[] }) => void, onCancel: () => void }> = ({ userData, onSave, onCancel }) => {
  const [tempData, setTempData] = useState({ ...userData });
  const [interestInput, setInterestInput] = useState('');

  const handleSave = () => {
    onSave(tempData);
  };

  const removeInterest = (tag: string) => {
    setTempData({
      ...tempData,
      interests: tempData.interests?.filter(i => i !== tag)
    });
  };

  const addInterest = () => {
    if (interestInput.trim() && !tempData.interests?.includes(interestInput.trim())) {
      setTempData({
        ...tempData,
        interests: [...(tempData.interests || []), interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <button onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-50 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-slate-900">Edit Profile</h1>
        <button onClick={handleSave} className="text-indigo-600 font-bold px-4 py-2 hover:bg-indigo-50 rounded-xl transition-colors">
          Save
        </button>
      </header>

      <div className="p-6">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer">
            <img src={tempData.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <button className="mt-4 text-indigo-600 text-sm font-bold">Change Profile Photo</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Name</label>
            <input 
              type="text" 
              value={tempData.name} 
              onChange={e => setTempData({...tempData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
            <input 
              type="text" 
              value={tempData.username} 
              onChange={e => setTempData({...tempData, username: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bio</label>
            <textarea 
              rows={4}
              value={tempData.bio} 
              onChange={e => setTempData({...tempData, bio: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Interests</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tempData.interests?.map(tag => (
                <span key={tag} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>#{tag}</span>
                  <button onClick={() => removeInterest(tag)} className="hover:text-indigo-800"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Add interest..."
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addInterest()}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button onClick={addInterest} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-indigo-100">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pulse_auth') === 'true';
  });
  const [userData, setUserData] = useState<UserType & { interests?: string[] }>(() => {
    const saved = localStorage.getItem('pulse_user_data');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set(['u4']));
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTopics] = useState<string[]>(['DatingAdvice', 'TechTrends', 'Philosophy', 'HealthyLiving', 'TravelHacks']);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('General');
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  useEffect(() => {
    localStorage.setItem('pulse_user_data', JSON.stringify(userData));
  }, [userData]);
  
  useEffect(() => {
    api("/api/questions")
      .then((data) => {
        setQuestions(data);
      })
      .catch((err) => {
        console.error("Failed to load questions", err);
      });
  }, []);

  const handleLogin = (method: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      localStorage.setItem('pulse_auth', 'true');
      setIsLoggingIn(false);
    }, 1200);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pulse_auth');
    setShowSettingsSheet(false);
  };

  const handleToggleFollow = useCallback((userId: string) => {
    setFollowedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const handleVote = useCallback((id: string, vote: 'yes' | 'no') => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          userVote: vote,
          yesVotes: vote === 'yes' ? q.yesVotes + 1 : q.yesVotes,
          noVotes: vote === 'no' ? q.noVotes + 1 : q.noVotes
        };
      }
      return q;
    }));
  }, []);

  const handleLike = useCallback((id: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const newUserLiked = !q.userLiked;
        return {
          ...q,
          userLiked: newUserLiked,
          likes: newUserLiked ? q.likes + 1 : q.likes - 1
        };
      }
      return q;
    }));
  }, []);

  const handleLikeComment = useCallback((questionId: string, commentId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: likeCommentInList(q.comments, commentId)
        };
      }
      return q;
    }));
  }, []);

  const handleAddComment = useCallback((id: string, text: string, parentId?: string) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: userData.id,
      userName: userData.name,
      userAvatar: userData.avatar,
      text,
      createdAt: Date.now(),
      likes: 0,
      userLiked: false,
      replies: []
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        if (!parentId) {
          return { ...q, comments: [newComment, ...q.comments] };
        } else {
          return {
            ...q,
            comments: updateCommentsList(q.comments, parentId, newComment)
          };
        }
      }
      return q;
    }));
  }, [userData]);

  const handleDeleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleDeleteComment = useCallback((questionId: string, commentId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: removeCommentFromList(q.comments, commentId)
        };
      }
      return q;
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim()) {
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        authorId: userData.id,
        authorName: userData.name,
        authorAvatar: userData.avatar,
        category: newQuestionCategory,
        content: newQuestionText,
        yesVotes: 0,
        noVotes: 0,
        userVote: null,
        likes: 0,
        userLiked: false,
        comments: [],
        createdAt: Date.now()
      };
      setQuestions(prev => [newQuestion, ...prev]);
      setNewQuestionText('');
      setNewQuestionCategory('General');
      setActiveView('home');
    }
  };

  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 overflow-y-auto">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-500/20 backdrop-blur-xl border border-white/10 mb-6 shadow-2xl">
            <BarChart3 size={40} className="text-indigo-400" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Pulse</h1>
          <p className="text-indigo-200 text-sm font-medium opacity-80">
            {isSignupMode ? 'Join our community of over 1M+ voters' : 'The heart of community feedback.'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl space-y-4">
          <div className="flex bg-white/5 p-1 rounded-2xl mb-4">
            <button 
              onClick={() => setIsSignupMode(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isSignupMode ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsSignupMode(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isSignupMode ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <button 
            disabled={isLoggingIn}
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-900 h-14 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Chrome size={20} className="text-blue-500" />
            <span className="text-sm">{isLoggingIn ? 'Processing...' : (isSignupMode ? 'Sign up with Google' : 'Log in with Google')}</span>
          </button>

          <button 
            disabled={isLoggingIn}
            onClick={() => handleLogin('apple')}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-bold transition-all active:scale-[0.98] border border-white/10 disabled:opacity-50"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            <span className="text-sm">{isSignupMode ? 'Sign up with Apple' : 'Log in with Apple'}</span>
          </button>

          <button 
            disabled={isLoggingIn}
            onClick={() => handleLogin('phone')}
            className="w-full flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Smartphone size={20} />
            <span className="text-sm">{isSignupMode ? 'Sign up with Phone' : 'Log in with Phone'}</span>
          </button>

          <button 
            disabled={isLoggingIn}
            onClick={() => handleLogin('email')}
            className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/15 text-white h-14 rounded-2xl font-bold transition-all active:scale-[0.98] border border-white/5 disabled:opacity-50"
          >
            <Mail size={20} className="text-indigo-300" />
            <span className="text-sm">{isSignupMode ? 'Sign up with Email' : 'Log in with Email'}</span>
          </button>

          <div className="pt-2 flex items-center justify-center space-x-2">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Safety & Privacy First</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
        </div>

        <p className="mt-8 text-center text-indigo-300/40 text-[10px] px-8 leading-relaxed font-bold uppercase tracking-wider">
          Pulse encrypted authentication • {new Date().getFullYear()} Pulse Inc.
        </p>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
            <BarChart3 size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Pulse</h1>
        </div>
        
        <button 
          onClick={() => setActiveView('feed')} 
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative"
        >
          <Bell size={24} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4">
        {questions.length === 0 ? (
          <div className="text-center py-20">
            <Zap size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No questions yet. Why not create one?</p>
          </div>
        ) : (
          questions.map(q => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              currentUserId={userData.id}
              onVote={handleVote} 
              onLike={handleLike}
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
              onDeleteQuestion={handleDeleteQuestion}
              onDeleteComment={handleDeleteComment}
              isFollowingAuthor={followedUserIds.has(q.authorId)}
              onToggleFollow={() => handleToggleFollow(q.authorId)}
            />
          ))
        )}
      </main>
    </div>
  );

  const renderSearch = () => (
    <div className="pb-32 px-4 pt-4">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics, questions, or people..."
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <section className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={18} className="text-orange-500" />
          <h2 className="font-bold text-slate-800">Trending Topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map(topic => (
            <button 
              key={topic}
              onClick={() => setSearchQuery(topic)}
              className="bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              #{topic}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-slate-800 mb-4">Results</h2>
        {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
           <QuestionCard 
            key={q.id} 
            question={q} 
            currentUserId={userData.id}
            onVote={handleVote} 
            onLike={handleLike}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteComment={handleDeleteComment}
            isFollowingAuthor={followedUserIds.has(q.authorId)}
            onToggleFollow={() => handleToggleFollow(q.authorId)}
          />
        )) : (
          <p className="text-slate-400 text-center py-10">No matches found for your search.</p>
        )}
      </section>
    </div>
  );

  const renderAdd = () => (
    <div className="pb-32 min-h-screen bg-slate-50 overflow-y-auto pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
               <Plus size={24} className="text-white" strokeWidth={3} />
             </div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Poll</h1>
          </div>
          <button 
            onClick={() => setActiveView('home')} 
            className="p-2.5 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full shadow-sm transition-all border border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl shadow-indigo-100/40 border border-slate-100 mb-6">
          <div className="flex items-start space-x-4 mb-10">
            <div className="relative flex-shrink-0">
              <img src={userData.avatar} className="w-16 h-16 rounded-2xl border-2 border-slate-50 shadow-md object-cover" alt="User Avatar" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white">
                <Sparkles size={12} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-lg mb-1">{userData.name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Asking the community</p>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Ask something like: 'Should we ban plastic straws?'"
                rows={4}
                className="w-full border-none focus:ring-0 text-2xl font-semibold resize-none placeholder-slate-200 p-0 leading-tight min-h-[140px]"
              ></textarea>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-t border-slate-50 pt-8">
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <Filter size={14} className="text-indigo-500" />
                  <span>Choose Category</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setNewQuestionCategory(cat)}
                    className={`px-4 py-3.5 rounded-[18px] text-[13px] font-bold transition-all border text-center flex items-center justify-center group ${
                      newQuestionCategory === cat 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-white hover:text-indigo-600'
                    }`}
                  >
                    <span>{cat === 'Dating' ? '🔥 Dating' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handlePostQuestion}
                disabled={!newQuestionText.trim()}
                className="w-full bg-indigo-600 text-white py-6 rounded-[24px] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
              >
                <span>Post Question</span>
                <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                Instant Engagement • Real-time Results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="pb-32 px-4 pt-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
      </header>
      <div className="space-y-4">
        {[
          { id: 1, user: 'Sarah Jenkins', action: 'liked your poll', time: '2m ago', icon: Heart, color: 'text-rose-500' },
          { id: 2, user: 'Tom Black', action: 'commented on your poll', time: '1h ago', icon: MessageSquare, color: 'text-indigo-500' },
          { id: 3, user: 'Jordan Lee', action: 'voted "Yes" on your poll', time: '3h ago', icon: Zap, color: 'text-emerald-500' },
          { id: 4, user: 'Alex Rivera', action: 'started following you', time: '5h ago', icon: User, color: 'text-blue-500' }
        ].map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-4 shadow-sm">
            <div className={`p-2 rounded-full bg-slate-50 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-800">
                <span className="font-bold">{item.user}</span> {item.action}
              </p>
              <p className="text-xs text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => {
    const userQuestions = questions.filter(q => q.authorId === userData.id);
    const votesCast = questions.filter(q => q.userVote).length;

    return (
      <div className="pb-32 relative">
        <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex justify-end p-4">
          <button 
            onClick={() => setShowSettingsSheet(true)}
            className="w-10 h-10 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/20 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="px-6 -mt-12 mb-6">
          <div className="flex justify-between items-end mb-4">
            <img src={userData.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
            <button 
              onClick={() => setActiveView('edit-profile')}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Edit Profile
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900">{userData.name}</h1>
          <p className="text-slate-500 mb-4">@{userData.username}</p>
          <p className="text-slate-700 text-sm leading-relaxed mb-6">{userData.bio}</p>

          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {userData.interests?.map(interest => (
                <span key={interest} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">#{interest}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6 mb-8">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{userData.followers}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{userData.following}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Following</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{votesCast}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Votes</p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <span>Your Polls</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{userQuestions.length}</span>
          </h3>

          <div className="space-y-4">
            {userQuestions.length === 0 ? (
              <p className="text-center text-slate-400 py-10">You haven't posted any polls yet.</p>
            ) : (
              userQuestions.map(q => (
                <QuestionCard 
                  key={q.id} 
                  question={q} 
                  currentUserId={userData.id}
                  onVote={handleVote} 
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onDeleteQuestion={handleDeleteQuestion}
                  onDeleteComment={handleDeleteComment}
                  isFollowingAuthor={followedUserIds.has(q.authorId)}
                  onToggleFollow={() => handleToggleFollow(q.authorId)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-slate-50 relative overflow-x-hidden">
      <div className="min-h-screen animate-in fade-in slide-in-from-bottom duration-500">
        {activeView === 'home' && renderHome()}
        {activeView === 'search' && renderSearch()}
        {activeView === 'add' && renderAdd()}
        {activeView === 'feed' && renderFeed()}
        {activeView === 'profile' && renderProfile()}
        {activeView === 'edit-profile' && (
          <EditProfileView 
            userData={userData} 
            onSave={(data) => { setUserData(data); setActiveView('profile'); }}
            onCancel={() => setActiveView('profile')}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 flex items-center justify-around px-2 py-3 z-50">
        <button onClick={() => setActiveView('home')} className={`flex items-center justify-center flex-1 transition-all ${activeView === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={28} strokeWidth={activeView === 'home' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveView('search')} className={`flex items-center justify-center flex-1 transition-all ${activeView === 'search' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Search size={28} strokeWidth={activeView === 'search' ? 2.5 : 2} />
        </button>
        <div className="flex-1 flex justify-center">
           <button onClick={() => setActiveView('add')} className="relative -top-6 transform transition-transform active:scale-95">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl border border-slate-50">
              <div className="w-[52px] h-[52px] rounded-full border-[3px] border-indigo-600 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Plus size={30} strokeWidth={3} />
                </div>
              </div>
            </div>
          </button>
        </div>
        <button onClick={() => setActiveView('feed')} className={`flex items-center justify-center flex-1 transition-all ${activeView === 'feed' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Zap size={28} strokeWidth={activeView === 'feed' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveView('profile')} className={`flex items-center justify-center flex-1 transition-all ${activeView === 'profile' || activeView === 'edit-profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <User size={28} strokeWidth={activeView === 'profile' || activeView === 'edit-profile' ? 2.5 : 2} />
        </button>
      </nav>

      {/* Settings Bottom Sheet */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowSettingsSheet(false)}></div>
          <div className="relative bg-white w-full max-w-2xl mx-auto rounded-t-[20px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">Settings</h2>

            <div className="space-y-1">
              {[
                { label: 'Account', icon: User, color: 'text-indigo-600' },
                { label: 'Notifications', icon: Bell, color: 'text-orange-500' },
                { label: 'Privacy & Security', icon: Shield, color: 'text-emerald-600' },
                { label: 'App Settings', icon: Settings, color: 'text-slate-600' },
                { label: 'About Pulse', icon: Info, color: 'text-blue-500' },
                { label: 'Log Out', icon: LogOut, color: 'text-rose-600', onClick: handleLogout },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-white ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-medium text-slate-800">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowSettingsSheet(false)}
              className="w-full mt-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
