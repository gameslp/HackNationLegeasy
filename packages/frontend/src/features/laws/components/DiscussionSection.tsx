'use client';

import { useState, useEffect } from 'react';
import { Discussion } from '@/lib/api/types';
import { useCreateDiscussion } from '../hooks/useLaws';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { MessageCircle, Send, Shield, AlertTriangle, Flag } from 'lucide-react';
import Link from 'next/link';

const CONSENT_STORAGE_KEY = 'legeasy_discussion_consent';
const NICKNAME_STORAGE_KEY = 'legeasy_nickname';

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
  const [hasConsent, setHasConsent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const createDiscussion = useCreateDiscussion();

  useEffect(() => {
    const savedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (savedNickname) {
      setNickname(savedNickname);
    }
    if (savedConsent === 'true') {
      setHasConsent(true);
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
    if (!ageConfirmed || !rulesAccepted) return;

    setNickname(newNickname);
    setHasConsent(true);
    localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    setShowNicknameModal(false);
    setAgeConfirmed(false);
    setRulesAccepted(false);
  };

  const canSubmitNickname = nickname.trim() && ageConfirmed && rulesAccepted;

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
        {/* Safety notice for all users */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Zasady bezpieczeństwa:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-amber-700">
              <li>Nie podawaj danych osobowych (imię, nazwisko, adres, telefon, email)</li>
              <li>Nie udostępniaj informacji pozwalających na identyfikację</li>
              <li>Komentarze są publiczne i widoczne dla wszystkich</li>
            </ul>
          </div>
        </div>

        {/* Nickname modal with consent */}
        {showNicknameModal && (
          <div
            className="mb-6 p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 shadow-md animate-in fade-in duration-300"
            role="dialog"
            aria-labelledby="nickname-modal-title"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <p id="nickname-modal-title" className="text-sm font-semibold text-gray-700">
                Podaj swój nick, aby dodawać komentarze:
              </p>
            </div>

            <div className="mb-4">
              <Input
                placeholder="Twój nick (pseudonim)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full"
                aria-label="Podaj pseudonim"
                aria-describedby="nickname-hint"
              />
              <p id="nickname-hint" className="text-xs text-gray-500 mt-1">
                Użyj pseudonimu - nie podawaj prawdziwego imienia i nazwiska.
              </p>
            </div>

            {/* Age confirmation */}
            <div className="space-y-3 mb-4 p-3 bg-white/70 rounded-lg border border-primary-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  aria-describedby="age-desc"
                />
                <span id="age-desc" className="text-sm text-gray-700">
                  <strong>Potwierdzam, że mam ukończone 16 lat</strong> lub działam za zgodą
                  i pod nadzorem rodzica/opiekuna prawnego.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  aria-describedby="rules-desc"
                />
                <span id="rules-desc" className="text-sm text-gray-700">
                  Akceptuję{' '}
                  <Link
                    href="/regulamin"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Regulamin
                  </Link>{' '}
                  i{' '}
                  <Link
                    href="/polityka-prywatnosci"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Politykę Prywatności
                  </Link>
                  . Rozumiem, że nie powinienem/powinnam podawać danych osobowych.
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNicknameModal(false);
                  setAgeConfirmed(false);
                  setRulesAccepted(false);
                }}
                type="button"
              >
                Anuluj
              </Button>
              <Button
                onClick={() => handleSetNickname(nickname)}
                disabled={!canSubmitNickname}
                type="button"
              >
                Zapisz i kontynuuj
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(discussion.createdAt).toLocaleString('pl-PL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {/* DSA Report Button */}
                    <Link
                      href={`/zgloszenie?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&comment=${discussion.id}`}
                      className="text-gray-400 hover:text-amber-600 transition-colors p-1 rounded-full hover:bg-amber-50"
                      title="Zgłoś treść (DSA)"
                      aria-label="Zgłoś tę treść jako nielegalną"
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
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
