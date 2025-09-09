'use client';

import { useCreateMilestone } from '@/app/(admin)/_api/use-create-milestone';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminCreateMilestoneSchema } from '@/schemas/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { MilestoneType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNewMilestone } from '../_hooks/use-new-milestone';

const formSchema = adminCreateMilestoneSchema.extend({
  threshold: z
    .string()
    .min(1, { message: 'Threshold is required' })
    .transform((val) => Number(val)),
});

type FormValues = z.infer<typeof formSchema>;

export function MilestoneForm() {
  const { mutate, isPending } = useCreateMilestone();
  const { onClose } = useNewMilestone();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      threshold: 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder='First 100 votes'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  placeholder='Achieved when a user casts their 100th vote'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select milestone type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(MilestoneType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='threshold'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Threshold</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    type='number'
                    min={1}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Value needed to achieve</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button disabled={isPending} type='submit'>
            Create Milestone
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
