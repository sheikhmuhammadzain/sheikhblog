import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubjects } from '@/hooks/useSubjects';
import type { Post } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  subject_id: z.string().min(1, 'Subject is required'),
});

export type PostFormData = z.infer<typeof schema>;

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  defaultValues?: Partial<Post>;
  loading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function PostForm({ 
  onSubmit, 
  defaultValues, 
  loading = false,
  submitLabel = 'Save',
  onCancel
}: PostFormProps) {
  const { subjects } = useSubjects();
  const { register, handleSubmit, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Input
          placeholder="Post Title"
          className="w-full"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <select
          className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
          {...register('subject_id')}
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {errors.subject_id && (
          <p className="text-sm text-red-500">{errors.subject_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Post Content"
          className="min-h-[200px] w-full"
          {...register('content')}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}