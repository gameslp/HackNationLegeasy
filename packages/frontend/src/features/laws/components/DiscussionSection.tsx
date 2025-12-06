'use client';

import { useState, useEffect } from 'react';
import { Discussion } from '@/lib/api/types';
import { useCreateDiscussion } from '../hooks/useLaws';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { MessageCircle, Send } from 'lucide-react';

interface DiscussionSectionProps {
  discussions: Discussion[];
  lawId: string;
  phaseId: string;
  stageId: string;
}

export function DiscussionSection({
  discussions,
  lawId,
  phaseId,
  stageId,
}: DiscussionSectionProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const createDiscussion = useCreateDiscussion();

  useEffect(() => {
    const savedNickname = localStorage.getItem('legeasy_nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname) {
      setShowNicknameModal(true);
      return;
    }

    if (!content.trim()) return;

    await createDiscussion.mutateAsync({
      lawId,
      phaseId,
      stageId,
      data: { nickname, content },
    });

    setContent('');
  };

  const handleSetNickname = (newNickname: string) => {
    setNickname(newNickname);
    localStorage.setItem('legeasy_nickname', newNickname);
    setShowNicknameModal(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Dyskusja</h3>
          <span className="text-sm text-gray-500">({discussions.length})</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Nickname modal */}
        {showNicknameModal && (
          <div className="mb-6 p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 shadow-md animate-in fade-in duration-300">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Podaj swój nick, aby dodawać komentarze:
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Twój nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => handleSetNickname(nickname)}
                disabled={!nickname.trim()}
              >
                Zapisz
              </Button>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-3 mb-6">
          {discussions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                Brak komentarzy. Bądź pierwszy!
              </p>
            </div>
          ) : (
            discussions.map((discussion, index) => (
              <div
                key={discussion.id}
                className="bg-gradient-to-br from-gray-50 to-slate-50/50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-700">
                        {discussion.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {discussion.nickname}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(discussion.createdAt).toLocaleString('pl-PL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-10">
                  {discussion.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder={
                nickname
                  ? 'Dodaj komentarz...'
                  : 'Kliknij, aby ustawić nick i komentować...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onClick={() => !nickname && setShowNicknameModal(true)}
              rows={2}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || !nickname || createDiscussion.isPending}
            size="lg"
            className="self-end"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>

        {nickname && (
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-700">
                {nickname.charAt(0).toUpperCase()}
              </span>
            </span>
            Komentujesz jako: <strong className="text-gray-700">{nickname}</strong>
            <button
              onClick={() => setShowNicknameModal(true)}
              className="text-primary-600 hover:text-primary-700 hover:underline font-medium ml-1"
            >
              (zmień)
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
