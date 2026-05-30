'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

const STORAGE_PREFIX = 'help-feedback:';

interface HelpArticleFeedbackProps {
  category: string;
  articleSlug: string;
}

export function HelpArticleFeedback({ category, articleSlug }: HelpArticleFeedbackProps) {
  const t = useTranslations('helpArticleFeedback');
  const storageKey = `${STORAGE_PREFIX}${category}/${articleSlug}`;
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setSubmitted(true);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const submit = useCallback(
    async (selected: 'helpful' | 'not_helpful', withComment = false) => {
      if (submitted || isSubmitting) return;
      setIsSubmitting(true);
      setRating(selected);
      try {
        await postData({
          url: '/help/feedback/',
          data: {
            category,
            article_slug: articleSlug,
            rating: selected,
            comment: withComment ? comment.trim() : '',
          },
        });
        try {
          localStorage.setItem(storageKey, selected);
        } catch {
          /* ignore */
        }
        setSubmitted(true);
        toast.success(t('toasts.thanks'));
      } catch {
        toast.error(t('toasts.saveFailed'));
        setRating(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [category, articleSlug, comment, isSubmitting, storageKey, submitted, t]
  );

  if (submitted) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200 rounded-lg bg-gray-50 px-6 py-5 text-center">
        <p className="text-sm font-medium text-gray-900">{t('thanksTitle')}</p>
        <p className="text-sm text-gray-500 mt-1">{t('thanksDescription')}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <p className="text-base font-medium text-gray-900 mb-4">{t('question')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={rating === 'helpful' ? 'default' : 'outline'}
          size="sm"
          disabled={isSubmitting}
          onClick={() => {
            if (showComment && rating === 'helpful') {
              void submit('helpful', true);
            } else {
              setRating('helpful');
              setShowComment(true);
            }
          }}
          className="gap-2"
        >
          <ThumbsUp className="w-4 h-4" />
          {t('yes')}
        </Button>
        <Button
          type="button"
          variant={rating === 'not_helpful' ? 'default' : 'outline'}
          size="sm"
          disabled={isSubmitting}
          onClick={() => {
            setRating('not_helpful');
            setShowComment(true);
          }}
          className="gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          {t('no')}
        </Button>
      </div>

      {showComment && rating && (
        <div className="mt-4 space-y-3 max-w-lg">
          <Textarea
            placeholder={
              rating === 'not_helpful'
                ? t('placeholderNotHelpful')
                : t('placeholderHelpful')
            }
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => void submit(rating, true)}
          >
            {isSubmitting ? t('sending') : t('submit')}
          </Button>
        </div>
      )}
    </div>
  );
}
