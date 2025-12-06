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
          <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-700 mb-2">
              Podaj swój nick, aby dodawać komentarze:
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Twój nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
        <div className="space-y-4 mb-6">
          {discussions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Brak komentarzy. Bądź pierwszy!
            </p>
          ) : (
            discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {discussion.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(discussion.createdAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {discussion.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
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
            />
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || !nickname || createDiscussion.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {nickname && (
          <p className="text-xs text-gray-500 mt-2">
            Komentujesz jako: <strong>{nickname}</strong>{' '}
            <button
              onClick={() => setShowNicknameModal(true)}
              className="text-primary-600 hover:underline"
            >
              (zmień)
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
