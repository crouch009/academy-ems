import React, { useState, useMemo } from 'react';
import { Course, Student, Instructor, ForumPost, ForumReply } from '../types';

interface CommunityProps {
  courses: Course[];
  students: Student[];
  instructors: Instructor[];
  posts: ForumPost[];
  onUpdatePosts: (posts: ForumPost[]) => void;
}

const TOPIC_TAGS = ['سؤال', 'نقاش', 'إعلان', 'مشروع', 'مساعدة', 'نجاح'];

const Community: React.FC<CommunityProps> = ({ courses, students, instructors, posts, onUpdatePosts }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [] as string[] });
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (selectedCourse) {
      filtered = filtered.filter(p => p.courseId === selectedCourse);
    }
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, selectedCourse]);

  const getAuthorName = (id: string, role: string) => {
    if (role === 'student') return students.find(s => s.id === id)?.name || 'طالب';
    if (role === 'instructor') return instructors.find(i => i.id === id)?.name || 'مدرس';
    return 'الإدارة';
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    const post: ForumPost = {
      id: Date.now().toString(),
      courseId: selectedCourse || courses[0]?.id || '',
      authorId: 'admin',
      authorRole: 'admin',
      title: newPost.title,
      content: newPost.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      tags: newPost.tags,
      isPinned: false,
    };
    onUpdatePosts([post, ...posts]);
    setNewPost({ title: '', content: '', tags: [] });
    setShowNewPost(false);
  };

  const handleReply = (postId: string) => {
    const text = replyText[postId];
    if (!text?.trim()) return;
    const reply: ForumReply = {
      id: Date.now().toString(),
      authorId: 'admin',
      authorRole: 'admin',
      content: text,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    onUpdatePosts(posts.map(p => p.id === postId ? { ...p, replies: [...p.replies, reply] } : p));
    setReplyText({ ...replyText, [postId]: '' });
  };

  const toggleLike = (postId: string) => {
    onUpdatePosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">🌐 مجتمع التعلم العالمي</h2>
        <p className="text-slate-500">تفاعل مع الطلاب والمدرسين وشارك خبراتك</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-blue-100 text-sm">المنشورات</p>
          <p className="text-3xl font-bold">{posts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">↳</div>
          <p className="text-emerald-100 text-sm">الردود</p>
          <p className="text-3xl font-bold">{posts.reduce((a, p) => a + p.replies.length, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">👍</div>
          <p className="text-pink-100 text-sm">الإعجابات</p>
          <p className="text-3xl font-bold">{posts.reduce((a, p) => a + p.likes, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-violet-100 text-sm">الأعضاء النشطين</p>
          <p className="text-3xl font-bold">{students.length + instructors.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            <option value="">جميع الكورسات</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setShowNewPost(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-violet-700"
          >
            + منشور جديد
          </button>
          <div className="flex-1" />
          <div className="text-xs text-slate-500">
            {filteredPosts.length} منشور
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">منشور جديد</h3>
              <button onClick={() => setShowNewPost(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="عنوان المنشور"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="محتوى المنشور..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">الوسوم</p>
                <div className="flex gap-2 flex-wrap">
                  {TOPIC_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setNewPost(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        newPost.tags.includes(tag) 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNewPost(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-2xl font-semibold hover:bg-slate-200">
                  إلغاء
                </button>
                <button onClick={handleCreatePost} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700">
                  نشر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-slate-500">لا توجد منشورات بعد - كن الأول!</p>
          </div>
        ) : filteredPosts.map(post => {
          const course = courses.find(c => c.id === post.courseId);
          return (
            <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {post.isPinned && (
                <div className="bg-amber-100 px-4 py-1 text-xs text-amber-800 font-semibold">📌 مثبت</div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      post.authorRole === 'instructor' ? 'bg-violet-500' : post.authorRole === 'admin' ? 'bg-blue-600' : 'bg-emerald-500'
                    }`}>
                      {getAuthorName(post.authorId, post.authorRole).charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{getAuthorName(post.authorId, post.authorRole)}</p>
                      <p className="text-xs text-slate-500">
                        {post.authorRole === 'instructor' ? '👨‍🏫 مدرس' : post.authorRole === 'admin' ? '👨‍💼 الإدارة' : '👨‍🎓 طالب'} • 
                        {new Date(post.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{course?.name}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{post.title}</h3>
                <p className="text-slate-600 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                <div className="flex gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm border-t pt-3">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 text-slate-500 hover:text-blue-600">
                    👍 {post.likes}
                  </button>
                  <span className="flex items-center gap-1 text-slate-500">
                    💬 {post.replies.length} رد
                  </span>
                  <div className="flex-1" />
                  <span className="text-xs text-slate-400">في {course?.name}</span>
                </div>
              </div>

              {/* Replies */}
              {post.replies.length > 0 && (
                <div className="bg-slate-50 px-6 py-4 border-t space-y-3">
                  {post.replies.map(reply => (
                    <div key={reply.id} className="bg-white rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          reply.authorRole === 'instructor' ? 'bg-violet-500' : reply.authorRole === 'admin' ? 'bg-blue-600' : 'bg-emerald-500'
                        }`}>
                          {getAuthorName(reply.authorId, reply.authorRole).charAt(0)}
                        </div>
                        <p className="font-semibold text-sm">{getAuthorName(reply.authorId, reply.authorRole)}</p>
                        <span className="text-xs text-slate-400">{new Date(reply.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                      <p className="text-sm text-slate-600">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="px-6 py-4 border-t bg-slate-50/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText[post.id] || ''}
                    onChange={e => setReplyText({ ...replyText, [post.id]: e.target.value })}
                    onKeyPress={e => e.key === 'Enter' && handleReply(post.id)}
                    placeholder="اكتب رداً..."
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleReply(post.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                  >
                    رد
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Community;
